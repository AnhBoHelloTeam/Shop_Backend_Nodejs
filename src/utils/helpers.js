import icons from './icon'

const { AiFillStar, AiOutlineStar } = icons
// export const formatMoney = (number) => Number(number.toFixed(1)).toLocaleString();

export const formatMoney = (number) => new Intl.NumberFormat('vi-VN').format(number) + ' VNĐ';;



export const validate = (payload, setInvalidFields) => {
    let invalids = 0;
    const formatPayload = Object.entries(payload);
    const newInvalidFields = []; // Tạm lưu lỗi mới để tránh trùng lặp

    // Kiểm tra trường rỗng
    for (let [key, value] of formatPayload) {
        if (value.trim() === "") {
            invalids++;
            newInvalidFields.push({ name: key, message: "Trường này là bắt buộc." });
        }
    }

    // Kiểm tra định dạng
    for (let [key, value] of formatPayload) {
        if (value.trim() === "") continue; // Bỏ qua nếu đã rỗng, tránh lỗi trùng
        switch (key) {
            case "email":
                const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (!value.match(emailRegex)) {
                    invalids++;
                    newInvalidFields.push({
                        name: key,
                        message: "Email không hợp lệ. Vui lòng kiểm tra lại!",
                    });
                }
                break;
            case "password":
                if (value.length < 6) {
                    invalids++;
                    newInvalidFields.push({
                        name: key,
                        message: "Mật khẩu phải dài ít nhất 6 ký tự.",
                    });
                }
                break;
            case "phone": // Đổi từ 'mobile' thành 'phone' để khớp với payload
                const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
                if (!value.match(phoneRegex)) {
                    invalids++;
                    newInvalidFields.push({
                        name: key,
                        message: "Số điện thoại không hợp lệ. Vui lòng kiểm tra lại!",
                    });
                }
                break;
            default:
                break;
        }
    }

    setInvalidFields(newInvalidFields); // Cập nhật một lần duy nhất
    return invalids;
};