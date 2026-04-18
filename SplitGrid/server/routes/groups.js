const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupController');

router.post('/', controller.createGroup);
router.post('/demo', controller.createDemo);
router.get('/:id', controller.getGroup);
router.post('/:id/expense', controller.addExpense);
router.post('/:id/settle', controller.addSettlement);
router.delete('/:id/expense/:expenseId', controller.removeExpense);

module.exports = router;
