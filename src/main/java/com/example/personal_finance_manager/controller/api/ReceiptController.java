package com.example.personal_finance_manager.controller.api;

import com.example.personal_finance_manager.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

  private final ReceiptService receiptService;

  // =====================================================
  // STEP 1
  //
  // Create receipt with PENDING_UPLOAD and generate
  // signed Cloudinary upload parameters.
  // =====================================================

  @PostMapping("/upload-init")
  public ResponseEntity<ReceiptUploadInitResponse> initializeUpload(@RequestParam Long userId) {

    ReceiptService.UploadInitData data = receiptService.initializeUpload(userId);

    ReceiptUploadInitResponse response =
        new ReceiptUploadInitResponse(
            data.receiptId(),
            data.status(),
            data.uploadUrl(),
            data.cloudName(),
            data.apiKey(),
            data.timestamp(),
            data.publicId(),
            data.signature());

    return ResponseEntity.ok(response);
  }

  // =====================================================
  // STEP 2
  //
  // Called after browser successfully uploaded
  // image to Cloudinary.
  //
  // PENDING_UPLOAD -> UPLOADED
  // =====================================================

  @PostMapping("/{receiptId}/upload-complete")
  public ResponseEntity<Void> completeUpload(
      @PathVariable Long receiptId, @RequestBody ReceiptUploadCompleteRequest request) {

    receiptService.completeUpload(receiptId, request.publicId(), request.secureUrl());

    return ResponseEntity.ok().build();
  }

  // =====================================================
  // DTO
  // =====================================================

  public record ReceiptUploadCompleteRequest(String publicId, String secureUrl) {}

  public record ReceiptUploadInitResponse(
      Long receiptId,
      String status,
      String uploadUrl,
      String cloudName,
      String apiKey,
      long timestamp,
      String publicId,
      String signature) {}
}
