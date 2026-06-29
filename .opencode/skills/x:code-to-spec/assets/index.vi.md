<!--
Mục lục / bản đồ tính năng tiếng Việt (tương thích Astro Starlight). Mỗi dòng một
màn hình, nhóm theo khu vực rồi tính năng. Liên kết tương đối với file này.
-->
---
title: "Đặc tả ứng dụng"
description: "Đặc tả theo từng màn hình cho QA, PM, người dùng cuối và lập trình viên."
---

Sinh tự động từ mã nguồn ngày {{DATE}}. Phát hiện {{SCREEN_TOTAL}} màn hình trên
{{AREA_TOTAL}} khu vực. Mỗi dòng liên kết tới đặc tả đầy đủ của màn hình đó.

## Cách đọc

- **Mã màn hình** định danh mỗi màn hình (vd: `Ad_JF_006` = Admin → Job Fair → 006).
- Khu vực không có mã màn hình cũ dùng định danh `Area-Controller` (vd: `Ag-Help`).
- Mỗi đặc tả gồm mục đích, ai dùng, có gì trên màn hình, quy tắc nghiệp vụ,
  kiểm tra hợp lệ và thông báo — chi tiết kỹ thuật được thu gọn trong khối riêng.

## {{AREA_NAME}}

### {{FEATURE_NAME}}

| Mã màn hình | Tên | Mục đích | Đặc tả |
|---|---|---|---|
| {{SCREEN_ID}} | {{NAME}} | {{PURPOSE_SHORT}} | [mở]({{REL_PATH}}) |

## Phạm vi

- Số màn hình phát hiện: {{SCREEN_TOTAL}}
- Màn hình có mã rõ ràng: {{EXPLICIT_COUNT}}
- Đã đặc tả: {{DONE_COUNT}}
- Chưa đặc tả: {{TODO_COUNT}}
