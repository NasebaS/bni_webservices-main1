const { APIResponse } = require("../utils/constants");
const Ledger = require("../models/ledger");

exports.getAllLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.findAll(); 
    res.status(200).json({ status: APIResponse.Success, data: ledgers });
  } catch (error) {
    res.status(500).json({ status: APIResponse.ServerError, message: error.message });
  }
};

exports.createLedger = async (req, res) => {
  try {
    const { ledger_name, ledger_type, status } = req.body;
    const newLedger = await Ledger.create({ ledger_name, ledger_type, status });
    res.status(201).json({ status: APIResponse.Success, data: newLedger });
  } catch (error) {
    res.status(500).json({ status: APIResponse.ServerError, message: error.message });
  }
};

exports.updateLedger = async (req, res) => {
  try {
    const ledgerId = req.params.ledgerId;
    const { ledger_name, ledger_type, status } = req.body;
    
    const ledgerToUpdate = await Ledger.findByPk(ledgerId);
    if (!ledgerToUpdate) {
      return res.status(404).json({ status: APIResponse.Failed, message: "Ledger not found" });
    }

    await ledgerToUpdate.update({ ledger_name, ledger_type, status });
    res.status(200).json({ status: APIResponse.Success, message: "Ledger updated successfully" });
  } catch (error) {
    res.status(500).json({ status: APIResponse.ServerError, message: error.message });
  }
};

exports.deleteLedger = async (req, res) => {
  try {
    const ledgerId = req.params.ledgerId;
    
    const ledgerToDelete = await Ledger.findByPk(ledgerId);
    if (!ledgerToDelete) {
      return res.status(404).json({ status: APIResponse.Failed, message: "Ledger not found" });
    }

    await ledgerToDelete.destroy();
    res.status(200).json({ status: APIResponse.Success, message: "Ledger deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: APIResponse.ServerError, message: error.message });
  }
};
