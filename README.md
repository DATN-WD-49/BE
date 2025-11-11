# Cách làm việc với github

## 1. Tách nhánh theo chức cần thiết từ nhánh phát triển (dev)

- Sử dụng câu lệnh ở trên nhánh dev `git branch -M ten-nhanh`. (Tính năng mới thì sẽ đặt tên nhánh theo tên tính năng còn nếu fix lỗi thì sẽ có tiền tố là fix/ten-nhanh).

## 2. Gói code và đẩy code

- Sau khi code hoàn thiện chức năng hoặc 50%-70% thì đẩy code lên bằng các cách
- Bước 1: `git add .` để gói các file có sự thay đổi và chuẩn bị commit.
- Bước 2: `git commit -m "tin nhắn"` đẩy các file thay đổi lên theo tên commit.
- Bước 3: `git push origin ten-nhanh-hien-tai` để đẩy các commit lên nhánh mới của mình.
- Bước 4: sau khi đẩy nhánh thành công lên tạo pull request và không có conflict thì báo lại leader merge pull request.


(payload được dùng để test PostMan phần createManySchedule)
{
    "carId": "69086e2e45591f307711e898",
  "routeId": "690f50a517d616fab16c2e67",
  "price": 200,
  "startTime": "2025-10-25T19:00:00.000Z",
  "untilTime": "2025-12-11T02:00:00.000Z"
}