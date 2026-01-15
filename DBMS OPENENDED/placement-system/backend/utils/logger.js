const pool = require('../config/database');

const logAction = async (email, action, tableName = null) => {
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO Audit_Logs (User_Email, Action, Table_Name) VALUES (?, ?, ?)',
            [email, action, tableName]
        );
        connection.release();
    } catch (error) {
        console.error('Audit logging failed:', error);
    }
};

module.exports = { logAction };
