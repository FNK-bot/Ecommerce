const Order = require('../../models/order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Get Dashboard Page
const getDashboard = async (req, res) => {
    try {
        res.status(200).render('admin/dashboard');
    } catch (error) {
        console.log('Error rendering dashboard:', error);
        res.status(500).render('error');
    }
};

// API for Sales Data
const getSalesReportApi = async (req, res) => {
    try {
        res.status(200).send('Sales data API');
        console.log('Get sales data API');
    } catch (error) {
        console.log('Error fetching sales data:', error);
        res.status(500).render('error');
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
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.text(`Total Sales: ${totalSale}`);
    doc.text(`Total Revenue: $${totalRevenue}`);
    doc.text(`Total Discount: $${totalDiscount}`);

    orders.forEach(order => {
        doc.text(`Order ID: ${order.orderID} | Amount: $${order.totalPrice} | Discount: $${order.discount}`);
    });

    doc.end();
    console.log('PDF created at', filePath);
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
        });

        const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);
        const totalDiscount = orders.reduce((acc, item) => acc + item.discount, 0);
        const totalSale = orders.length;

        if (req.query.download === 'pdf') {
            const filePath = generatePDF(orders, totalRevenue, totalDiscount, totalSale);
            res.download(filePath, 'salesReport.pdf', (err) => {
                if (err) {
                    console.log('Error downloading file', err);
                    res.status(500).send("Error downloading file");
                } else {
                    fs.unlinkSync(filePath);
                }
            });
        } else if (req.query.download === 'excel') {
            const filePath = await generateExcel(orders, totalRevenue, totalDiscount, totalSale);
            res.download(filePath, 'salesReport.xlsx', (err) => {
                if (err) {
                    console.log('Error downloading file', err);
                    res.status(500).send("Error downloading file");
                } else {
                    fs.unlinkSync(filePath);
                }
            });
        } else {
            res.render('admin/salesReport', { orders, totalRevenue, totalSale, totalDiscount });
        }
    } catch (error) {
        console.log('Error in sales report page', error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { getDashboard, getSalesReportApi, getSalesReportPage };
