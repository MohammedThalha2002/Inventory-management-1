const { response } = require("express");
const { where } = require("sequelize");
const {
  Ticket,
  Store,
  Warehouse,
  Products,
  User,
} = require("../database/database");

exports.getTicketRequest = async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.json(tickets);
  } catch (error) {
    console.log(error);
  }
};
exports.getTicketApprove = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ where: { status: "APPROVAL" } });
    res.json(tickets);
  } catch (error) {
    console.log(error);
  }
};
exports.postTicketRequest = async (req, res) => {
  try {
    const { part_no, quantity, name } = req.body;
    const user = await User.findOne({ where: { name: name } });
    const ticket = await Ticket.create({
      product_part_no: part_no,
      product_quantity: quantity,
      user_id: user.id,
    });
	console.log('====================================');
	console.log(ticket,"SS",user,"SS");
	console.log('====================================');
    const getStore = await Store.findOne({
      where: { product_part_no: part_no },
    });
    const getWarehouse = await Warehouse.findOne({
      where: { product_part_no: part_no },
    });
    const storeTotal = getStore.dataValues.product_limit;
    const warehouseTotal = getWarehouse.dataValues.product_quantity;

    if (getStore.dataValues.product_quantity >= quantity) {
      const updatedValueStore = getStore.dataValues.product_quantity - quantity;

      await Store.update(
        { product_quantity: updatedValueStore },
        {
          where: { product_part_no: part_no },
        }
      );
    } else if (getWarehouse.dataValues.product_quantity >= quantity) {
      const updatedValueWarehouse =
        warehouseTotal - (storeTotal - getStore.dataValues.product_quantity);
      const updatedValueStore = storeTotal - quantity;

      await Warehouse.update(
        { product_quantity: updatedValueWarehouse },
        {
          where: { product_part_no: part_no },
        }
      );
      await Store.update(
        { product_quantity: updatedValueStore },
        {
          where: { product_part_no: part_no },
        }
      );

    } else {
		await Ticket.update({status:"APPROVAL"},{ where: { ticket_id: ticket.ticket_id } });
    

     
    }

    
  } catch (error) {
    console.log(error);
  }
};

exports.updateTicketRequest = async (req, res) => {
  try {
    const ticket_id = req.params.ticket_id;
    const ticket = await Ticket.findOne({ where: { ticket_id: ticket_id } });
    if (ticket) {
      ticket.status = "CLOSE";
      await ticket.save();
    }
  } catch (error) {
    console.log(error);
  }
};

exports.ticketCheck = async (req, res) => {
  try {
    const ticket_id = req.params.ticket_id;

    const getTicket = await Ticket.findOne({ where: { ticket_id: ticket_id } });
    const getStore = await Store.findOne({
      where: { product_part_no: getTicket.dataValues.product_part_no },
    });
    const getWarehouse = await Warehouse.findOne({
      where: { product_part_no: getTicket.dataValues.product_part_no },
    });
    const storeTotal = getStore.dataValues.product_limit;
    const warehouseTotal = getWarehouse.dataValues.product_limit;

    if (
      getStore?.getStore.dataValues.product_quantity >=
      getTicket?.getTicket.dataValues.product_quantity
    ) {
      const updatedValueStore =
        getStore.dataValues.product_quantity -
        getTicket.dataValues.product_quantity;

      getStore.dataValues.product_quantity = updatedValueStore;
      await getStore.save();
    } else if (
      getWarehouse?.getWarehouse.dataValues.product_quantity >=
      getTicket?.getTicket.dataValues.product_quantity
    ) {
      const updatedValueWarehouse =
        warehouseTotal - (storeTotal - getStore.dataValues.product_quantity);
      const updatedValueStore =
        storeTotal - getTicket.dataValues.product_quantity;

      getWarehouse.dataValues.product_quantity = warehouseTotal;
      getStore.dataValues.product_quantity = updatedValueStore;
      await getWarehouse.save();
      await getStore.save();
    } else {
      getTicket.status = "APPROVAL";
      await getTicket.save();

      console.log("approval");
    }

    console.log(getStore);
  } catch (error) {
    console.log(error);
  }
};
