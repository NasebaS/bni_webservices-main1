var cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const MirthRoute = require("./routes/auth/AjithController");
const MirthCollectionRoute = require("./routes/auth/mirthCollection");
const userLoginRoute = require("./routes/auth/AuthController");
const createMemberRoute = require("./routes/member/create-member");
const updateMemberRoute = require("./routes/member/update-member");
const uploadImageRoute = require("./routes/member/upload-member-image");
const getMemberRoute = require("./routes/member/get-member");
const getMeetingDateRoute = require("./routes/feeCollection/get-meetingdate");
const getCollectionMasterRoute = require("./routes/feeCollection/get-collection-master-data");
const addorUpdateFeeCollectionRoute = require("./routes/feeCollection/create-update-fee");
const getLedgerRoute = require("./routes/ledger/get-ledger");
const getLedgerSummaryRoute = require("./routes/ledger/get-ledger-summary");

const ledgerRoutes = require("./routes/ledger/ledger-routes");
const ledgerNames = require("./routes/ledgernames");
const incomeExpenseRoutes = require("./routes/incomeexpense/incomeexpense-routes");



var app = express();
const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors());
app.use(cors(corsOptions));
app.use(express.static("http://192.168.1.23/images"));
app.use('/images', express.static('images'));
app.use(bodyParser.json());


app.use("/validateUserLogin", userLoginRoute);
app.use("/createMember", createMemberRoute);
app.use("/updateMember", updateMemberRoute);
app.use("/getmember", getMemberRoute);
app.use("/uploadMemberImage", uploadImageRoute);
app.use("/getMeetingDate", getMeetingDateRoute);
app.use("/getCollectionMaster", getCollectionMasterRoute);
app.use("/addorUpdateFeeCollection", addorUpdateFeeCollectionRoute);
app.use("/getLedger", getLedgerRoute);
app.use("/getLedgerSummary", getLedgerSummaryRoute);
app.use("/mirthApi", MirthRoute);
app.use("/mirthCollectionApi", MirthCollectionRoute);

app.use("/api/ledger", ledgerRoutes);
app.use("/ledgernames", ledgerNames);
app.use("/api/expense", incomeExpenseRoutes);

app.listen(3000);