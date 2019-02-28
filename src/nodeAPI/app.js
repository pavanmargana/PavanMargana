var express = require("express");
var app = express();
var port = 4000;
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/ExcelDB", {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useNewUrlParser: true
});

//Upload Table
var recordSchema = new mongoose.Schema({
    SDN_eSDN: String,
    SDN_No: String,
    TITLE: String,
    REPORTING_DATE: String,
    CODE_CONVERSION: String,
    PROJECT_MANAGER: String,
    IBM_PROJECT_LEAD: String,
    IBM_TECHNICAL_LEAD: String,
    STATUS: String,
    PROJECT_HEALTH: String,
    RISK: String,
    ISSUE: String,
    DELIVERABLE: String,
    FIRST_MILESTONE: String,
    EFFORT: String,
    DEFECT_DEPENDENCY: String,
    REPORTINGWEEK: String,
    PHASE: String,
    MILESTONE_END_DATE: String,
    DELIVERABLE1: String,
    BASELINE_EFFORT_FTE: String,
    ACTUAL_EFFORT_FTE: String,
    ETC: String,
    EAC: String,
    SIT: String,
    UAT: String,
    PROD: String,
    BASELINE: String,
    ACTUALS: String,
    ETC1: String,
    EAC1: String,
    COMMENTS: String,
    RISK1: String,
    ISSUE1: String,
    DELIVERABLE2: String,
    SECOND_MILESTONE: String,
    EFFORT1: String,
    DEFECT_DEPENDENCY1: String,
    CR: String,
    PIR_Duration: String,
    Planned_Activities: String
}, { collection: 'WSRRecords' });

var Records = mongoose.model("Records", recordSchema);
var GetRecords = mongoose.model("WSRRecords", recordSchema, 'WSRRecords');


var LoginSchema = new mongoose.Schema({
    FirstName: String,
    LastName: String,
    Role: String,
    UserId: String,
    Password: String
}, { collection: 'LoginDatabase' });
var GetUsers = mongoose.model("LoginDatabase", LoginSchema, 'LoginDatabase');

//GET WSR EXCEL SHEET UPLOAD DATA
app.get("/getdata", (req, res) => {
    GetRecords.find({}, function (err, docs) {
        if (err) res.json(err);
        else res.send(docs);
    });
});

//UPLOAD WSR EXCEL SHEET DATA
app.post("/upload", (req, res) => {
    var myData = req.body;
    var erroresult = [];
    for (var key in myData) {
        if (myData.hasOwnProperty(key)) {
            var Data = myData[key];
            var NewReport = new Records(Data);
            NewReport.save(function (err) {
                if (err) {
                    erroresult.push('Error while inserting records');
                }
                else {
                    result = 'Succssfully inserted records';
                }
            });
        }
    }
    if (erroresult.length > 0) {
        res.sendStatus(404);
    }
    else {
        res.sendStatus(200);
    }
});

//ADD RECORD OF WSR DATA TO NEW TABLE
app.post('/add', (req, res) => {
    var NewReport = new GetRecords(req.body);
    NewReport.save(function (err) {
        if (err) {
            res.sendStatus(404);
        }
        else {
            res.sendStatus(200);
        }
    });
});

app.post('/update', (req, res) => {
    var NewReport = new Records(req.body); 
    console.log(JSON.stringify(NewReport));
    GetRecords.findOne({_id: NewReport._id}, function (err, report) {
        if (!report)
            res.sendStatus(404);
        else {
            report.SDN_eSDN = NewReport.SDN_eSDN;
            report.SDN_No = NewReport.SDN_No;
            report.TITLE = NewReport.TITLE;
            report.REPORTING_DATE = NewReport.REPORTING_DATE;
            report.CODE_CONVERSION = NewReport.CODE_CONVERSION;
            report.PROJECT_MANAGER = NewReport.PROJECT_MANAGER;
            report.IBM_PROJECT_LEAD = NewReport.IBM_PROJECT_LEAD;
            report.IBM_TECHNICAL_LEAD = NewReport.IBM_TECHNICAL_LEAD;
            report.STATUS = NewReport.STATUS;
            report.PROJECT_HEALTH = NewReport.PROJECT_HEALTH;
            report.RISK = NewReport.RISK;
            report.ISSUE = NewReport.ISSUE;
            report.DELIVERABLE = NewReport.DELIVERABLE;
            report.FIRST_MILESTONE = NewReport.FIRST_MILESTONE;
            report.EFFORT = NewReport.EFFORT;
            report.DEFECT_DEPENDENCY = NewReport.DEFECT_DEPENDENCY;
            report.REPORTINGWEEK = NewReport.REPORTINGWEEK;
            report.PHASE = NewReport.PHASE;
            report.MILESTONE_END_DATE = NewReport.MILESTONE_END_DATE;
            report.DELIVERABLE1 = NewReport.DELIVERABLE1;
            report.BASELINE_EFFORT_FTE = NewReport.BASELINE_EFFORT_FTE;
            report.ACTUAL_EFFORT_FTE = NewReport.ACTUAL_EFFORT_FTE;
            report.ETC = NewReport.ETC;
            report.EAC = NewReport.EAC;
            report.SIT = NewReport.SIT;
            report.UAT = NewReport.UAT;
            report.PROD = NewReport.PROD;
            report.BASELINE = NewReport.BASELINE;
            report.ACTUALS = NewReport.ACTUALS;
            report.ETC1 = NewReport.ETC1;
            report.EAC1 = NewReport.EAC1;
            report.COMMENTS = NewReport.COMMENTS;
            report.RISK1 = NewReport.RISK1;
            report.ISSUE1 = NewReport.ISSUE1;
            report.DELIVERABLE2 = NewReport.DELIVERABLE2;
            report.SECOND_MILESTONE = NewReport.SECOND_MILESTONE;
            report.EFFORT1 = NewReport.EFFORT1;
            report.DEFECT_DEPENDENCY1 = NewReport.DEFECT_DEPENDENCY1;
            report.CR = NewReport.CR;
            report.PIR_Duration = NewReport.PIR_Duration;
            report.Planned_Activities = NewReport.Planned_Activities;
            report.save().then(item => {
                res.sendStatus(200);
            }).catch(err => {
                res.sendStatus(404);
            });
        }
    });
});

//DELETE RECORD FROM WSR TABLE
app.post('/delete', (req, res) => {
    var myData = new Records(req.body);
    GetRecords.findOne({ _id: myData._id }, function (err, report) {
        GetRecords.findByIdAndRemove({ _id: myData._id }, function (err, report1) {
            if (err) res.sendStatus(404);
            else res.sendStatus(200);
        });
    });
});


app.post('/Validate', (req, res) => {   
    var User = GetUsers(req.body);
    GetUsers.find({}, function (err, docs) {
        docs=docs.filter(a=> User.UserId == a.UserId && User.Password == a.Password);
        if (err) res.json(err);
        else res.send(docs);
    });
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});