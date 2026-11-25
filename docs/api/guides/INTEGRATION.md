# Integration tutorial

Complete [local setup](GETTING_STARTED.md). The examples below use PowerShell and `Invoke-RestMethod`. No Authorization header is currently supported. Set the actual seeded user ID instead of 1.

```powershell
$base = 'http://localhost:8080/api'
$userId = 1
$uri = "$base/users/$userId/transactions"
Invoke-RestMethod "$base/users/$userId"
$body = @{ amount=15.25; currencyCode='EUR'; transactionDate='2026-11-25'; description='Groceries' } | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri $uri -ContentType 'application/json' -Body $body
$id = $created.id
$created
Invoke-RestMethod $uri
Invoke-RestMethod "$uri/recent"
Invoke-RestMethod "$uri/date/2026-11-25"
Invoke-RestMethod "$uri/filter?from=2026-11-01&to=2026-11-30"
Invoke-RestMethod "$uri/$id"
$updated = @{ amount=20.00; currencyCode='EUR'; transactionDate='2026-11-25'; description='Groceries corrected' } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "$uri/$id" -ContentType 'application/json' -Body $updated
Invoke-RestMethod -Method Delete -Uri "$uri/$id"
```

Expected statuses: creation 201, reads and update 200, delete 204 with no body. Verify the deleted transaction returns 404. To test validation, repeat the POST with amount 0 (expected 400) or request `filter?from=2026-12-01&to=2026-11-01` (expected 400). Do not automatically retry creation after a timeout; query history first to avoid duplicates.

## Receipt upload workflow

Requires a genuine development Cloudinary account and a synthetic image. The following commands use the live signature, not the placeholder examples in the reference. The external provider is not part of the OpenAPI paths.

```powershell
$init = Invoke-RestMethod -Method Post -Uri "$base/receipts/upload-init?userId=$userId"
$upload = curl.exe -sS -X POST $init.uploadUrl -F 'file=@receipt.jpg' -F "api_key=$($init.apiKey)" -F "timestamp=$($init.timestamp)" -F "public_id=$($init.publicId)" -F "signature=$($init.signature)" | ConvertFrom-Json
if (-not $upload.secure_url) { throw 'Cloudinary upload failed' }
$confirmation = @{ publicId=$upload.public_id; secureUrl=$upload.secure_url } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/receipts/$($init.receiptId)/upload-complete" -ContentType 'application/json' -Body $confirmation
```

Expected confirmation: 200, no body, receipt becomes UPLOADED. The worker can then process it via PostgreSQL when separately configured. There is no HTTP polling or result endpoint yet. An invalid public ID, URL or repeated confirmation currently raises an unmapped exception (expected 500); inspect local logs and do not blindly retry. This walkthrough is source-derived and not yet executed against a running backend.
