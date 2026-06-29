<!--
Mẫu đặc tả màn hình tiếng Việt (tương thích Astro Starlight).
Viết bằng NGÔN NGỮ NGHIỆP VỤ DỄ HIỂU — PM hoặc người dùng cuối phải hiểu được.
Mọi chi tiết mã nguồn/route/file chỉ để trong khối "Ghi chú kỹ thuật" thu gọn.
Điền mọi {{PLACEHOLDER}}; chỉ xóa mục nào thực sự không áp dụng.
-->
---
title: "{{SCREEN_ID}} — {{SCREEN_NAME}}"
description: "{{MO_TA_MOT_DONG}}"
---

> **Mã màn hình:** {{SCREEN_ID}} · **Tính năng:** {{FEATURE}} · **Khu vực:** {{AREA}} ({{ACTOR}})
> _Sinh tự động từ mã nguồn ngày {{DATE}}._

## Mục đích

{{MUC_DICH}}

## Ai sử dụng

- **Người dùng:** {{ACTORS}}
- **Điều kiện truy cập:** {{DIEU_KIEN_TRUY_CAP}}

## Trên màn hình có gì

{{THANH_PHAN_GIAO_DIEN}}

## Cách hoạt động

1. {{BUOC_THAO_TAC}}

## Quy tắc nghiệp vụ

> Màn hình làm gì và điều kiện đằng sau mỗi hành vi.
> Khi quy tắc nhắc tới một thông báo, trích nguyên văn chuỗi gốc của app hoặc trỏ
> tới mục "Thông báo hiển thị" — tuyệt đối không diễn giải lại hay dịch thông báo.

- **BR-1.** {{QUY_TAC}}
- **BR-2.** {{QUY_TAC}}

## Dữ liệu nhập & kiểm tra hợp lệ

| Trường | Cho phép nhập gì | Bắt buộc |
|---|---|---|
| {{TEN_TRUONG}} | {{QUY_TAC_DIEN_GIAI}} | {{Có/Không}} |

## Thông báo hiển thị

| Tình huống | Thông báo (nguyên gốc) |
|---|---|
| {{TINH_HUONG}} | {{CHUOI_GOC}} |

## Màn hình liên quan

- {{MA_MAN_HINH_LIEN_QUAN}} — {{LY_DO_LIEN_QUAN}}

## Ghi chú

- {{TRUONG_HOP_DAC_BIET_HOAC_CAU_HOI_MO}}

<details>
<summary>Ghi chú kỹ thuật (route, validation, nguồn)</summary>

**Routes**

| Method | URL | Tên route | Action | Middleware |
|---|---|---|---|---|
| {{METHOD}} | `{{URI}}` | {{ROUTE_NAME}} | `{{CONTROLLER@ACTION}}` | {{MIDDLEWARE}} |

**Luật validation gốc**

| Trường | Luật |
|---|---|
| `{{FIELD}}` | `{{RAW_RULE}}` |

**Model dữ liệu:** {{MODELS}}

**File nguồn:**
- Route: `{{ROUTE_FILE}}`
- Controller: {{CONTROLLER_FILES}}
- Form Request: {{REQUEST_FILES}}
- View / Page: {{VIEW_FILES}}
- Lang: {{LANG_FILES}}

</details>
