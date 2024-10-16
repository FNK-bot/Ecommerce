const Order = require('../../models/order');
const Product = require('../../models/product')
const Category = require('../../models/catagory');
const Brand = require('../../models/brand');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');


// Get Dashboard Page
const getDashboard = async (req, res) => {
    try {
        //fetch Orders
        let orders = await Order.find()

        //remove nested array object to flat
        let product_ids = orders.map((order) => order.productId.flat());
        product_ids = product_ids.flat()

        //logic to find repeating product id
        let obj = {};
        product_ids.forEach((productId) => {
            if (obj[productId] === undefined) {
                obj[productId] = 1;
            }
            else {
                obj[productId]++
            }
        })

        //setting a Limit for rendering (like top 5 \\5 is limit) 
        let limit = Object.keys(obj).length < 5 ? Object.keys(obj).length : 5;

        // Sort the keys based on their corresponding values in descending order and limit to top 5
        const top10Products = Object.keys(obj)
            .sort((a, b) => obj[b] - obj[a]) // Sort by values (largest first)
            .slice(0, limit); // Limit to top 5

        //fetch top Products 
        let findProducts = await Product.find({ _id: { $in: top10Products } });

        let products = findProducts.map((val) => val.name);

        let category_id = findProducts.map((val) => val.categary);

        let categaryList = await Category.find({ _id: { $in: category_id } });

        let brand_ids = findProducts.map((val) => val.brand);

        let brandList = await Brand.find({ _id: { $in: brand_ids } });

        res.status(200).render('admin/dashboard', {
            product: products, limit,
            brand: brandList,
            catagory: categaryList,
        });

    } catch (error) {
        console.error('Error in get dashboard', error)
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// API for Sales Data
const getSalesReportApi = async (req, res) => {
    try {
        //fetch Monthly sales
        const monthlySales = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $month: '$createdOn',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id': 1,
                },
            },
        ]);

        //fetch monthly sales 
        const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySales.find((item) => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });

        //fetch product Per month
        const productsPerMonth = Array(12).fill(0);

        // Iterate through each product
        const products = await Product.find();
        products.forEach(product => {
            // Extract month from the createdAt timestamp
            const creationMonth = product.createdAt.getMonth(); // JavaScript months are 0-indexed

            // Increment the count for the corresponding month
            productsPerMonth[creationMonth]++;
        });

        res.json({ productsPerMonth, monthlySalesArray })

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
};

// Generate Excel Function
const generateExcel = async (orders, totalRevenue, totalDiscount, totalSale) => {
    const dirPath = path.join(__dirname, '../../public/admin/assets/excel');
    fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, 'salesReport.xlsx');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales Report');

    sheet.columns = [
        { header: 'Order ID', key: 'orderID', width: 20 },
        { header: 'Customer', key: 'userName', width: 30 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Total Amount', key: 'totalPrice', width: 15 },
        { header: 'Discount', key: 'discount', width: 15 },
        { header: 'Payment Method', key: 'method', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
    ];

    orders.forEach(order => {
        sheet.addRow(order);
    });

    await workbook.xlsx.writeFile(filePath);
    return filePath;
};

// Generate PDF Function
const generatePDF = (orders, totalRevenue, totalDiscount, totalSale) => {
    const dirPath = path.join(__dirname, '../../public/admin/assets/pdf');
    fs.mkdirSync(dirPath, { recursive: true });

    const filePath = path.join(dirPath, 'salesReport.pdf');
    const doc = new PDFDocument({ margin: 30 });
    doc.pipe(fs.createWriteStream(filePath));

    // Add Title
    doc.fontSize(20).text('Sales Report', { align: 'center' });

    doc.moveDown();

    doc.moveDown(1.5);

    // Table Header
    doc.fontSize(10).font('Helvetica-Bold');
    const tableTop = doc.y;
    const col1 = 30, col2 = 120, col3 = 210, col4 = 300, col5 = 390;

    doc.text('Order ID', col1, tableTop);
    doc.text('Amount', col2, tableTop);
    doc.text('Discount', col3, tableTop);
    doc.text('Method', col4, tableTop);
    doc.text('Status', col5, tableTop);

    doc.moveTo(30, doc.y + 5).lineTo(570, doc.y + 5).stroke();
    doc.moveDown()
    // Table Rows
    doc.font('Helvetica').moveDown(0.5);
    orders.forEach(order => {
        const rowTop = doc.y;

        doc.text(order.orderID, col1, rowTop, { width: 90, align: 'left' });
        doc.text(`${order.totalPrice}`, col2, rowTop, { width: 90, align: 'left' });
        doc.text(`${order.discount}`, col3, rowTop, { width: 90, align: 'left' });
        doc.text(order.method, col4, rowTop, { width: 90, align: 'left' });
        doc.text(order.status, col5, rowTop, { width: 90, align: 'left' });

        doc.moveTo(30, doc.y + 5).lineTo(570, doc.y + 5).stroke();
        doc.moveDown();
    });

    // Finalize PDF
    doc.end();
    return filePath;
};

// Get Sales Report Page and Handle Download
const getSalesReportPage = async (req, res) => {
    try {
        let { filter } = req.query;
        let startDate, endDate;

        const now = new Date();

        switch (filter) {
            case 'daily':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.setDate(startDate.getDate() + 6));
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            case 'custom':
                startDate = new Date(req.query.startDate);
                endDate = new Date(req.query.endDate);
                break;
            default:
                startDate = new Date(0);
                endDate = new Date();
        }

        const orders = await Order.find({
            createdOn: { $gte: startDate, $lte: endDate },
            isDeleted: false
        }).populate('userId')

        const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);
        const totalDiscount = orders.reduce((acc, item) => acc + item.discount, 0);
        const totalSale = orders.length;

        const availableDates = await Order.distinct('createdOn');
        const dates = availableDates.map(date => date.toISOString().split('T')[0]);

        if (req.query.download === 'pdf') {
            const filePath = generatePDF(orders, totalRevenue, totalDiscount, totalSale);
            setTimeout(() => {
                return res.download(filePath, 'salesReport.pdf', (err) => {
                    if (err) {

                        return res.status(500).send("Error downloading file");
                    } else {
                        fs.unlinkSync(filePath);
                    }
                }, 5000);
            })

        } else if (req.query.download === 'excel') {

            const filePath = await generateExcel(orders, totalRevenue, totalDiscount, totalSale);
            return res.download(filePath, 'salesReport.xlsx', (err) => {
                if (err) {

                    return res.status(500).send("Error downloading file");
                } else {
                    fs.unlinkSync(filePath);
                }
            });

        } else {

            res.render('admin/salesReport', {
                orders, totalRevenue, totalSale, totalDiscount,
                dates,
            });
        }
    } catch (error) {
        console.error('Error in sales report page', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getDashboard, getSalesReportApi, getSalesReportPage };
