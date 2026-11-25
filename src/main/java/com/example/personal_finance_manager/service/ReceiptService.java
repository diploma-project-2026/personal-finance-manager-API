package com.example.personal_finance_manager.service;

import com.cloudinary.Cloudinary;
import com.example.personal_finance_manager.entity.Receipt;
import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.enums.ReceiptStatus;
import com.example.personal_finance_manager.repository.ReceiptRepository;
import com.example.personal_finance_manager.repository.UserRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReceiptService {

  private final ReceiptRepository receiptRepository;
  private final UserRepository userRepository;
  private final Cloudinary cloudinary;

  @Value("${cloudinary.cloud-name}")
  private String cloudName;

  @Value("${cloudinary.api-key}")
  private String apiKey;

  @Value("${cloudinary.api-secret}")
  private String apiSecret;

  // =====================================================
  // INITIALIZE UPLOAD
  // =====================================================

  @Transactional
  public UploadInitData initializeUpload(Long userId) {

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

    // Unique Cloudinary path.
    String publicId = "receipts/" + userId + "/" + UUID.randomUUID();

    long timestamp = Instant.now().getEpochSecond();

    // -------------------------------------------------
    // Parameters that will be signed for Cloudinary.
    // -------------------------------------------------

    Map<String, Object> params = new HashMap<>();

    params.put("timestamp", timestamp);

    params.put("public_id", publicId);

    String signature = cloudinary.apiSignRequest(params, apiSecret, 2);

    // -------------------------------------------------
    // Create receipt BEFORE actual upload.
    //
    // image_path is NOT NULL in your DB.
    // Therefore temporarily store publicId there.
    // -------------------------------------------------

    Receipt receipt =
        Receipt.builder()
            .user(user)
            .imagePath(publicId)
            .status(ReceiptStatus.PENDING_UPLOAD)
            .build();

    receipt = receiptRepository.save(receipt);

    // Cloudinary upload endpoint.
    String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

    return new UploadInitData(
        receipt.getId(),
        receipt.getStatus().name(),
        uploadUrl,
        cloudName,
        apiKey,
        timestamp,
        publicId,
        signature);
  }

  // =====================================================
  // COMPLETE UPLOAD
  // =====================================================

  @Transactional
  public Receipt completeUpload(Long receiptId, String publicId, String secureUrl) {

    Receipt receipt =
        receiptRepository
            .findById(receiptId)
            .orElseThrow(() -> new IllegalArgumentException("Receipt not found: " + receiptId));

    // Receipt must still be waiting for Cloudinary.
    if (receipt.getStatus() != ReceiptStatus.PENDING_UPLOAD) {

      throw new IllegalStateException("Receipt is not waiting for upload");
    }

    // -------------------------------------------------
    // Validate public ID
    // -------------------------------------------------

    if (publicId == null || !receipt.getImagePath().equals(publicId)) {

      throw new IllegalArgumentException("Invalid Cloudinary public id");
    }

    // -------------------------------------------------
    // Validate URL
    // -------------------------------------------------

    if (secureUrl == null || secureUrl.isBlank()) {

      throw new IllegalArgumentException("Cloudinary secure URL is required");
    }

    String expectedPrefix = "https://res.cloudinary.com/" + cloudName + "/";

    if (!secureUrl.startsWith(expectedPrefix)) {

      throw new IllegalArgumentException("Invalid Cloudinary URL");
    }

    // -------------------------------------------------
    // IMPORTANT:
    //
    // Python Worker reads receipts.image_path.
    //
    // From this point it contains a real HTTPS image.
    // -------------------------------------------------

    receipt.setImagePath(secureUrl);

    // Worker polls exactly this status.
    receipt.setStatus(ReceiptStatus.UPLOADED);

    return receiptRepository.save(receipt);
  }

  // =====================================================
  // INTERNAL RESULT
  // =====================================================

  public record UploadInitData(
      Long receiptId,
      String status,
      String uploadUrl,
      String cloudName,
      String apiKey,
      long timestamp,
      String publicId,
      String signature) {}
}
