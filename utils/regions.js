const regions = {
    "Northern": [
        "Ha Noi", "Hai Phong", "Quang Ninh", "Bac Giang", "Bac Kan", "Bac Ninh", "Cao Bang", "Dien Bien", "Ha Giang", "Ha Nam", "Hai Duong", "Hoa Binh", "Hung Yen", "Lai Chau", "Lang Son", "Lao Cai", "Nam Dinh", "Ninh Binh", "Phu Tho", "Son La", "Thai Binh", "Thai Nguyen", "Tuyen Quang", "Vinh Phuc", "Yen Bai", "Hà Nội", "Hải Phòng", "Quảng Ninh", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Cao Bằng", "Điện Biên", "Hà Giang", "Hà Nam", "Hải Dương", "Hòa Bình", "Hưng Yên", "Lai Châu", "Lạng Sơn", "Lào Cai", "Nam Định", "Ninh Bình", "Phú Thọ", "Sơn La", "Thái Bình", "Thái Nguyên", "Tuyên Quang", "Vĩnh Phúc", "Yên Bái"
    ],
    "Central": [
        "Da Nang", "Quang Binh", "Quang Nam", "Quang Ngai", "Thua Thien Hue", "Binh Dinh", "Binh Thuan", "Dak Lak", "Dak Nong", "Gia Lai", "Ha Tinh", "Khanh Hoa", "Kon Tum", "Lam Dong", "Nghe An", "Phu Yen", "Quang Tri", "Đà Nẵng", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Thừa Thiên Huế", "Bình Định", "Bình Thuận", "Đắk Lắk", "Đắk Nông", "Gia Lai", "Hà Tĩnh", "Khánh Hòa", "Kon Tum", "Lâm Đồng", "Nghệ An", "Phú Yên", "Quảng Trị"
    ],
    "Southern": [
        "Ho Chi Minh City", "An Giang", "Ba Ria - Vung Tau", "Bac Lieu", "Ben Tre", "Binh Duong", "Binh Phuoc", "Ca Mau", "Can Tho", "Dong Nai", "Dong Thap", "Hau Giang", "Kien Giang", "Long An", "Soc Trang", "Tay Ninh", "Tien Giang", "Tra Vinh", "Vinh Long", "Ho Chi Minh", "TP. Hồ Chí Minh", "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bến Tre", "Bình Dương", "Bình Phước", "Cà Mau", "Cần Thơ", "Đồng Nai", "Đồng Tháp", "Hậu Giang", "Kiên Giang", "Long An", "Sóc Trăng", "Tây Ninh", "Tiền Giang", "Trà Vinh", "Vĩnh Long"
    ]
};

const getRegion = (province) => {
    for (const [region, provinces] of Object.entries(regions)) {
        if (provinces.includes(province)) {
            return region;
        }
    }
    return null;
};

module.exports = { regions, getRegion };