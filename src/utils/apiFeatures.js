class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    search() {
        if (this.queryStr && this.queryStr.keyword) {
            const keyword = this.queryStr.keyword.trim();
            const words = keyword.split(/\s+/);
            const regex = new RegExp(keyword, 'i');
            const numberKeyword = parseFloat(keyword);
            let searchConditions = [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { categories: { $in: [keyword] } }
            ];
            // Add conditions for each word in the query
            words.forEach(word => {
                const wordRegex = new RegExp(word, 'i');
                searchConditions.push({ title: { $regex: wordRegex } });
                searchConditions.push({ description: { $regex: wordRegex } });
                searchConditions.push({ categories: { $in: [word] } });
                // Include conditions for individual categories
                searchConditions.push({ "categories.0": { $regex: wordRegex } });
                searchConditions.push({ "categories.1": { $regex: wordRegex } });
                searchConditions.push({ "categories.2": { $regex: wordRegex } });
                // Add more lines if you have more categories in your schema
            });
            // If keyword is a number, include number-specific search conditions
            if (!isNaN(numberKeyword)) {
                searchConditions.push({ price: numberKeyword });
                searchConditions.push({ id: numberKeyword });
            }

            this.query = this.query.find({
                $or: searchConditions
            });
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
    //filter
    filter() {
        const queryCopy = { ...this.queryStr };
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);
        for (const key in queryCopy) {
            if (!isNaN(parseInt(queryCopy[key]))) {
                queryCopy[key] = parseInt(queryCopy[key]);
            }
        }
        return this;
    }
    //filter by pincode both for product and shop
    filterByPincode() {
        const pincodes = this.queryStr.pincode;console.log("hw")
        // console.log(pincodes)
        if (pincodes) {
            const pincodeArray = pincodes.split(',').map(pin => pin.trim());
            this.query = this.query.find({ pinCodes: { $elemMatch: { $in: pincodeArray } } });
        }
        return this;
    }
    //filterby catagory product
    filterByCategoryProducts() {
        const categories = this.queryStr.categories;
        if (categories) {
            const categoryArray = categories.split(',').map(category => category.trim());
            this.query = this.query.find({ category: { $elemMatch: { $in: categoryArray } } });
        }
        return this;
    }
    // filter by category shop
    filterByCategoryShop() {
        const categories = this.queryStr.selectedCategories;
        if (categories) {
            const categoryArray = categories.split(',').map(category => category.trim());
            this.query = this.query.find({ category: { $elemMatch: { $in: categoryArray } } });
        }
        return this;
    }
    // Filter by shop id
    filterByShop() {
        const shopId = this.queryStr.shopid;
        if (shopId) {this.query = this.query.find({ shop: shopId });}
        return this;
    }
}
export { ApiFeatures };
