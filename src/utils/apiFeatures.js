class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? this.queryStr.keyword.trim() : '';
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            this.query = this.query.find({
                $or: [
                    { title: { $regex: regex } },
                    { description: { $regex: regex } },
                    { category: { $elemMatch: { $regex: regex } } },
                    { brand: { $regex: regex } },
                    { keyWords: { $elemMatch: { $regex: regex } } }
                ]
            });
        }
        return this;
    }

    filterByPincode() {
        const pincode = this.queryStr.pincode;
        if (pincode) {
            const pincodeArray = pincode.split(',').map(pin => pin.trim());
            this.query = this.query.find({ pinCodes: { $elemMatch: { $in: pincodeArray } } });
        }
        return this;
    }

    filterByCategoryProducts() {
        const categories = this.queryStr.categories;
        console.log("ko",categories)
        if (categories) {
            const categoryArray = categories.split(',').map(category => category.trim());
            this.query = this.query.find({ category: { $elemMatch: { $in: categoryArray } } });
        }
        return this;
    }


    filterByBrand() {
        const brands = this.queryStr.brands;
        console.log("br", brands);
        if (brands) {
            const brandArray = brands.split(',').map(brand => brand.trim());
            this.query = this.query.find({ brand: { $in: brandArray } });
        }
        return this;
    }
    

    filterByShop() {
        const shopId = this.queryStr.shopid;
        if (shopId) {
            this.query = this.query.find({ shop: shopId });
        }
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = parseInt(this.queryStr.page) || 1;
        const limit = parseInt(this.queryStr.limit) || resultPerPage;
        const skip = (currentPage - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ["keyword", "page", "limit", "pincode", "categories", "shopid"];
        removeFields.forEach((key) => delete queryCopy[key]);
        for (const key in queryCopy) {
            if (!isNaN(parseInt(queryCopy[key]))) {
                queryCopy[key] = parseInt(queryCopy[key]);
            }
        }
        if (Object.keys(queryCopy).length) {
            this.query = this.query.find(queryCopy);
        }
        return this;
    }

    getFilter() {
        return this.query.getFilter(); // Access the filter conditions for countDocuments
    }
}

export { ApiFeatures };
