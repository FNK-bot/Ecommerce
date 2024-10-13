const { isValidObjectId } = require('mongoose');
const User = require('../../models/user')

const getAllUsers = async (req, res) => {
    try {
        res.status(200)

        //fetch All user
        let allUsers = await User.find();

        //Pagination Logic
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allUsers.length / 5);
        const currentUsers = allUsers.slice(startindex, endindex);

        res.render('admin/users', { users: currentUsers, totalpages, currentpage })
    } catch (error) {

        console.error('Error in get all users ', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const blockUser = async (req, res) => {
    try {
        let id = req.params.id;

        //validate id
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'user not found',
            });
        }

        let user = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        }, { new: true });


        res.status(200).json({
            success: true,
            message: `User ${user.username} has been blocked.`,
        });
    } catch (error) {
        console.error('Error in block user', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking the user.',
        });
    }
}

const unBlockUser = async (req, res) => {
    try {
        let id = req.params.id;

        //validate id 
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'user not found',
            });
        }


        let user = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        }, { new: true });


        res.status(200).json({
            success: true,
            message: `User ${user.username} has been unblocked.`,
        });
    } catch (error) {
        console.error('Error in unblock user', error);
        res.status(500).json({
            success: false,
            message: 'Error unblocking the user.',
        });
    }
}

module.exports = { getAllUsers, blockUser, unBlockUser };