const regions = {
    "Northern": [
        "Ha Noi", "Hai Phong", "Quang Ninh", "Bac Giang", "Bac Kan", "Bac Ninh", "Cao Bang", "Dien Bien", "Ha Giang", "Ha Nam", "Hai Duong", "Hoa Binh", "Hung Yen", "Lai Chau", "Lang Son", "Lao Cai", "Nam Dinh", "Ninh Binh", "Phu Tho", "Son La", "Thai Binh", "Thai Nguyen", "Tuyen Quang", "Vinh Phuc", "Yen Bai"
    ],
    "Central": [
        "Da Nang", "Quang Binh", "Quang Nam", "Quang Ngai", "Thua Thien Hue", "Binh Dinh", "Binh Thuan", "Dak Lak", "Dak Nong", "Gia Lai", "Ha Tinh", "Khanh Hoa", "Kon Tum", "Lam Dong", "Nghe An", "Phu Yen", "Quang Tri"
    ],
    "Southern": [
        "Ho Chi Minh City", "An Giang", "Ba Ria - Vung Tau", "Bac Lieu", "Ben Tre", "Binh Duong", "Binh Phuoc", "Ca Mau", "Can Tho", "Dong Nai", "Dong Thap", "Hau Giang", "Kien Giang", "Long An", "Soc Trang", "Tay Ninh", "Tien Giang", "Tra Vinh", "Vinh Long", "Ho Chi Minh "
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