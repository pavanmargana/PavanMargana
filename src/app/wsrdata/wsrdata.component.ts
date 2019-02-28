import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { Reports, global } from '../model';
import { Http, Headers, RequestOptions } from '@angular/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common'

@Component({
    selector: 'app-wsrdata',
    templateUrl: './wsrdata.component.html',
    styleUrls: ['./wsrdata.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class WSRDATAComponent implements OnInit {
    @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
    @ViewChild('myInput') myInputVariable: ElementRef;
    Year: any;
    file: File;
    public response: any = [];
    EXcelData: Array<Reports> = [];
    Checkdata = false;
    SDNNo: Array<any> = ["Select SDN"];
    dataItem: Reports;
    SelectSDN: any;
    SelectedData: any[] = [];
    sender: any;
    public PhaseList: any = ['10/20/SFD', 'TSD', 'CUT/UIT', 'SIT/UAT', 'PIR'];
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 100
    };
    public formGroup: FormGroup;
    public _DatesList: any = [];
    public _reports: Array<Reports> = [];
    public gridData: GridDataResult = process(this._reports, this.gridState);
    private editedRowIndex: number;
    public isClickedOnce: boolean = true;
    public EXcelFileData: Array<any> = [];
    public arrayBuffer: any;
    public JSONDATA: any[] = [];
    public _CurrentWeek: any;
    public _categories: string[] = [];
    public _GR: string[] = [];
    public _YR: string[] = [];
    public _RR: string[] = [];
    public _CGR: number;
    public _CRR: number;
    public _CYR: number;
    public defaultItem: any;
    public DonutData: any = [];
    public gridOVState: State = {
        sort: [],
        skip: 0,
        take: 100
    };
    public gridOVData: GridDataResult = process(this._reports, this.gridOVState);
    public Showgrid: boolean = false;
    public CurrentHealth: any;
    public DonutSDNPhase: any;
    public sdnphasetotal: any = null;
    public DonutSDNEffort: any;
    public sdneffortotal: any = null;
    public linedata: any = [];
    public hidden: boolean = true;
    public validate: boolean = true;

    constructor(private _http: Http, private _datepipe: DatePipe, private sanitizer: DomSanitizer, private router: Router, private _global: global) {
        if (this._global.validate == 'MANAGER') {
            if (!this.validate) {
                this.validate = !this.validate;
            }
        }
        else if (this._global.validate == 'TEAMLEAD') {
            if (this.validate) {
                this.validate = !this.validate;
            }
        }
        else {
            window.location.href='/Login';
        }
    }

    public ngOnInit(): void {
        this.getData();
    }

    public getData() {
        var url = "http://localhost:4000/getdata";
        this._http.get(url, this.options).subscribe((result) => {
            this.response = result;
            this.EXcelData = JSON.parse(this.response._body);
            this._DatesList = [];
            this.EXcelData.forEach(a => {
                if (this.SDNNo.indexOf(a.SDN_No) == -1) {
                    this.SDNNo.push(a.SDN_No);
                }
                if (this._DatesList.indexOf(a.REPORTING_DATE) == -1) {
                    this._DatesList.push(a.REPORTING_DATE);
                }
            });
            this._DatesList.sort();
            var max_dt = this._DatesList[0],
                max_dtObj = new Date(this._DatesList[0]);
            this._DatesList.forEach(function (dt, index) {
                if (new Date(dt) > max_dtObj) {
                    max_dt = dt;
                    max_dtObj = new Date(dt);
                }
            });
            this._CurrentWeek = max_dt;
            this.defaultItem = max_dt;
            this._categories = [];
            this._GR = [];
            this._RR = [];
            this._YR = [];
            this.bardata();
            this.DropdownData();
            this.linedataset();
            this.SDNNo.sort();
            let i: number = 0;
            this.EXcelData.sort(function (a, b) { var c = +new Date(a.REPORTING_DATE); var d = +new Date(b.REPORTING_DATE); return c - d });
            this.EXcelData.reverse();
            for (var SDN of this.SDNNo) {
                i = 0;
                for (var rec of this.EXcelData) {
                    if (SDN == rec.SDN_No) {
                        if (i < 1) {
                            this.SelectedData.push(rec);
                        }
                        else {
                            break;
                        }
                        i++;
                    }
                };
            };
            this.SelectedData.reverse();
            this.gridData = process(this.SelectedData, this.gridState);
        }), catchError(error => {
            return throwError('Something went wrong!');
        });
    }

    public incomingfile(event) {
        this.file = event.target.files[0];
        this.isClickedOnce = false;
    }

    public Upload() {
        this.UploadData(this.file);
        this.isClickedOnce = true;
    }

    private getHeaders(): Headers {
        let headers = new Headers();
        headers.append('Pragma', 'no-cache');
        headers.append('Cache-Control', 'no-cache,no-store, max-age=0, must-revalidate');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        return headers;
    }

    public UploadData(file) {
        this.EXcelFileData = [];
        this.SelectedData = [];
        this.EXcelData = [];
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            var data = new Uint8Array(this.arrayBuffer);
            var arr = new Array();
            for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            var workbook = XLSX.read(bstr, { type: "binary" });
            workbook.SheetNames.forEach((key) => {
                var worksheet = workbook.Sheets[key];
                this.EXcelFileData = (XLSX.utils.sheet_to_json(worksheet, { raw: true }));
            });

            this.EXcelFileData.forEach(a => {
                let REPORTING_DATE = "";
                if (a.REPORTING_DATE != null && a.REPORTING_DATE != undefined) {
                    var date = new Date(1900, 0, a.REPORTING_DATE - 1);
                    REPORTING_DATE = date.toISOString().slice(0, 10);
                }
                let phase = null;
                if (a.PHASE != null && a.PHASE != undefined) {
                    if (a.PHASE.includes('10') || a.PHASE.includes('20') || a.PHASE.toUpperCase().includes('SFD') || a.PHASE.toUpperCase().includes('REQUIREMENT')) {
                        phase = this.PhaseList[0];
                    } else if (a.PHASE.toUpperCase().includes('TSD')) {
                        phase = this.PhaseList[1];
                    } else if (a.PHASE.toUpperCase().includes('CUT') || a.PHASE.toUpperCase().includes('UIT')) {
                        phase = this.PhaseList[2];
                    } else if (a.PHASE.toUpperCase().includes('SIT') || (a.PHASE.toUpperCase().includes('UAT'))) {
                        phase = this.PhaseList[3];
                    } else if (a.PHASE.toUpperCase().includes('PIR') || a.PHASE.toUpperCase().includes('ESDN') || a.PHASE.toUpperCase().includes('PROD')) {
                        phase = this.PhaseList[4]
                    }
                }
                var record = {
                    SDN_eSDN: a.SDN_eSDN != null && a.SDN_eSDN != undefined ? a.SDN_eSDN : null,
                    SDN_No: a.SDN_No != null && a.SDN_No != undefined ? a.SDN_No : null,
                    TITLE: a.TITLE != null && a.TITLE != undefined ? a.TITLE : null,
                    REPORTING_DATE: REPORTING_DATE,
                    CODE_CONVERSION: a.CODE_CONVERSION != null && a.CODE_CONVERSION != undefined ? a.CODE_CONVERSION : null,
                    PROJECT_MANAGER: a.PROJECT_MANAGER != null && a.PROJECT_MANAGER != undefined ? a.PROJECT_MANAGER : null,
                    IBM_PROJECT_LEAD: a.IBM_PROJECT_LEAD != null && a.IBM_PROJECT_LEAD != undefined ? a.IBM_PROJECT_LEAD : null,
                    IBM_TECHNICAL_LEAD: a.IBM_TECHNICAL_LEAD != null && a.IBM_TECHNICAL_LEAD != undefined ? a.IBM_TECHNICAL_LEAD : null,
                    STATUS: a.STATUS != null && a.STATUS != undefined ? a.STATUS : null,
                    PROJECT_HEALTH: a.PROJECT_HEALTH != null && a.PROJECT_HEALTH != undefined ? a.PROJECT_HEALTH.toUpperCase() : null,
                    RISK: a.RISK != null && a.RISK != undefined ? a.RISK.toUpperCase() : null,
                    ISSUE: a.ISSUE != null && a.ISSUE != undefined ? a.ISSUE.toUpperCase() : null,
                    DELIVERABLE: a.DELIVERABLE != null && a.DELIVERABLE != undefined ? a.DELIVERABLE.toUpperCase() : null,
                    FIRST_MILESTONE: a.FIRST_MILESTONE != null && a.FIRST_MILESTONE != undefined ? a.FIRST_MILESTONE.toUpperCase() : null,
                    EFFORT: a.EFFORT != null && a.EFFORT != undefined ? a.EFFORT.toUpperCase() : null,
                    DEFECT_DEPENDENCY: a.DEFECT_DEPENDENCY != null && a.DEFECT_DEPENDENCY != undefined ? a.DEFECT_DEPENDENCY.toUpperCase() : null,
                    REPORTINGWEEK: a.REPORTINGWEEK != null && a.REPORTINGWEEK != undefined ? a.REPORTINGWEEK : null,
                    PHASE: phase,
                    MILESTONE_END_DATE: a.MILESTONE_END_DATE != null && a.MILESTONE_END_DATE != undefined ? a.MILESTONE_END_DATE : null,
                    DELIVERABLE1: a.DELIVERABLE1 != null && a.DELIVERABLE1 != undefined ? a.DELIVERABLE1 : null,
                    BASELINE_EFFORT_FTE: a.BASELINE_EFFORT_FTE != null && a.BASELINE_EFFORT_FTE != undefined ? a.BASELINE_EFFORT_FTE : null,
                    ACTUAL_EFFORT_FTE: a.ACTUAL_EFFORT_FTE != null && a.ACTUAL_EFFORT_FTE != undefined ? a.ACTUAL_EFFORT_FTE : null,
                    ETC: a.ETC != null && a.ETC != undefined ? a.ETC : null,
                    EAC: a.EAC != null && a.EAC != undefined ? a.EAC : null,
                    SIT: a.SIT != null && a.SIT != undefined ? a.SIT : null,
                    UAT: a.UAT != null && a.UAT != undefined ? a.UAT : null,
                    PROD: a.PROD != null && a.PROD != undefined ? a.PROD : null,
                    BASELINE: a.BASELINE != null && a.BASELINE != undefined ? a.BASELINE : null,
                    ACTUALS: a.ACTUALS != null && a.ACTUALS != undefined ? a.ACTUALS : null,
                    ETC1: a.ETC1 != null && a.ETC1 != undefined ? a.ETC1 : null,
                    EAC1: a.EAC1 != null && a.EAC1 != undefined ? a.EAC1 : null,
                    COMMENTS: a.COMMENTS != null && a.COMMENTS != undefined ? a.COMMENTS : null,
                    RISK1: a.RISK1 != null && a.RISK1 != undefined ? a.RISK1 : null,
                    ISSUE1: a.ISSUE1 != null && a.ISSUE1 != undefined ? a.ISSUE1 : null,
                    DELIVERABLE2: a.DELIVERABLE2 != null && a.DELIVERABLE2 != undefined ? a.DELIVERABLE2 : null,
                    SECOND_MILESTONE: a.SECOND_MILESTONE != null && a.SECOND_MILESTONE != undefined ? a.SECOND_MILESTONE : null,
                    EFFORT1: a.EFFORT1 != null && a.EFFORT1 != undefined ? a.EFFORT1 : null,
                    DEFECT_DEPENDENCY1: a.DEFECT_DEPENDENCY1 != null && a.DEFECT_DEPENDENCY1 != undefined ? a.DEFECT_DEPENDENCY1 : null,
                    CR: a.CR != null && a.CR != undefined ? a.CR : null,
                    PIR_Duration: a.PIR_Duration != null && a.PIR_Duration != undefined ? a.PIR_Duration : null,
                    Planned_Activities: a.Planned_Activities != null && a.Planned_Activities != undefined ? a.Planned_Activities : null
                }

                if (record.RISK1 == null && record.ISSUE1 == null && record.DELIVERABLE2 == null && record.SECOND_MILESTONE == null && record.EFFORT1 == null && record.DEFECT_DEPENDENCY1 == null) {
                    record.RISK = "G";
                    record.ISSUE = "G";
                    record.DELIVERABLE = "G";
                    record.FIRST_MILESTONE = "G";
                    record.EFFORT = "G";
                    record.DEFECT_DEPENDENCY = "G";
                }
                else {

                    if (record.RISK1 != null) {
                        if (record.RISK == null) {
                            record.RISK = 'G'
                        }
                        else if (record.RISK == 'G') {
                            record.RISK = 'R'
                        }
                    }
                    else {
                        record.RISK = 'G'
                    }

                    if (record.ISSUE1 != null) {
                        if (record.ISSUE == null) {
                            record.ISSUE = 'G'
                        }
                        else if (record.ISSUE == 'G') {
                            record.ISSUE = 'R'
                        }
                    }
                    else {
                        record.ISSUE = 'G'
                    }

                    if (record.DELIVERABLE2 != null) {
                        if (record.DELIVERABLE == null) {
                            record.DELIVERABLE = 'G'
                        }
                        else if (record.DELIVERABLE == 'G') {
                            record.DELIVERABLE = 'R'
                        }
                    }
                    else {
                        record.DELIVERABLE = 'G'
                    }

                    if (record.SECOND_MILESTONE != null) {
                        if (record.FIRST_MILESTONE == null) {
                            record.FIRST_MILESTONE = 'G'
                        }
                        else if (record.FIRST_MILESTONE == 'G') {
                            record.FIRST_MILESTONE = 'R'
                        }
                    }
                    else {
                        record.FIRST_MILESTONE = 'G'
                    }

                    if (record.EFFORT1 != null) {
                        if (record.EFFORT == null) {
                            record.EFFORT = 'G'
                        }
                        else if (record.EFFORT == 'G') {
                            record.EFFORT = 'R'
                        }
                    }
                    else {
                        record.EFFORT = 'G'
                    }

                    if (record.DEFECT_DEPENDENCY1 != null) {
                        if (record.DEFECT_DEPENDENCY == null) {
                            record.DEFECT_DEPENDENCY = 'G'
                        }
                        else if (record.DEFECT_DEPENDENCY == 'G') {
                            record.DEFECT_DEPENDENCY = 'R'
                        }
                    }
                    else {
                        record.DEFECT_DEPENDENCY = 'G'
                    }

                    if (record.RISK == 'G' && record.ISSUE == 'G' && record.DELIVERABLE == 'G' && record.FIRST_MILESTONE == 'G' && record.EFFORT == 'G' && record.DEFECT_DEPENDENCY == 'G') {
                        record.PROJECT_HEALTH = "G";
                    }
                    else if (record.RISK == 'Y' || record.ISSUE == 'Y' || record.DELIVERABLE == 'Y' || record.FIRST_MILESTONE == 'Y' || record.EFFORT == 'Y' || record.DEFECT_DEPENDENCY == 'Y') {
                        record.PROJECT_HEALTH = "Y";
                    }
                    else {
                        record.PROJECT_HEALTH = "R";
                    }
                }
                this.JSONDATA.push(record);
            });
            var url = "http://localhost:4000/upload";
            this._http.post(url, this.JSONDATA, this.options).subscribe((result) => {
                if (result.status == 404) {
                    alert("Error! While inserting Records");
                }
                else if (result.status == 200) {
                    this.JSONDATA = [];
                    this.getData();
                    this.myInputVariable.nativeElement.value = "";
                }
            }), catchError(error => {
                return throwError('Something went wrong!');
            });
        }
        fileReader.readAsArrayBuffer(file);
    }

    public onStateChange(state: State) {
        this.gridState = state;
        if (this.gridState.filter != undefined && this.gridState.filter != null) {
            if (this.gridState.filter.filters.length > 0) {
                this.gridData = process(this.EXcelData, this.gridState);
            }
            else {
                this.gridData = process(this.SelectedData, this.gridState);
            }
        }
        else {
            this.gridData = process(this.SelectedData, this.gridState);
        }
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);
        this.formGroup = new FormGroup({
            'SDN_eSDN': new FormControl(),
            'SDN_No': new FormControl(),
            'TITLE': new FormControl(),
            'REPORTING_DATE': new FormControl(),
            'CODE_CONVERSION': new FormControl(),
            'PROJECT_MANAGER': new FormControl(),
            'IBM_PROJECT_LEAD': new FormControl(),
            'IBM_TECHNICAL_LEAD': new FormControl(),
            'STATUS': new FormControl(),
            'PROJECT_HEALTH': new FormControl(),
            'RISK': new FormControl(),
            'ISSUE': new FormControl(),
            'DELIVERABLE': new FormControl(),
            'FIRST_MILESTONE': new FormControl(),
            'EFFORT': new FormControl(),
            'DEFECT_DEPENDENCY': new FormControl(),
            'REPORTINGWEEK': new FormControl(),
            'PHASE': new FormControl(),
            'MILESTONE_END_DATE': new FormControl(),
            'DELIVERABLE1': new FormControl(),
            'BASELINE_EFFORT_FTE': new FormControl(),
            'ACTUAL_EFFORT_FTE': new FormControl(),
            'ETC': new FormControl(),
            'EAC': new FormControl(),
            'SIT': new FormControl(),
            'UAT': new FormControl(),
            'PROD': new FormControl(),
            'BASELINE': new FormControl(),
            'ACTUALS': new FormControl(),
            'ETC1': new FormControl(),
            'EAC1': new FormControl(),
            'COMMENTS': new FormControl(),
            'RISK1': new FormControl(),
            'ISSUE1': new FormControl(),
            'DELIVERABLE2': new FormControl(),
            'SECOND_MILESTONE': new FormControl(),
            'EFFORT1': new FormControl(),
            'DEFECT_DEPENDENCY1': new FormControl(),
            'CR': new FormControl(),
            'PIR_Duration': new FormControl(),
            'Planned_Activities': new FormControl(),
        });
        sender.addRow(this.formGroup);
    }

    public editHandler({ sender, rowIndex, dataItem }) {
        this.closeEditor(sender);
        this.formGroup = new FormGroup({
            '_id': new FormControl(dataItem._id),
            'SDN_eSDN': new FormControl(dataItem.SDN_eSDN),
            'SDN_No': new FormControl(dataItem.SDN_No),
            'TITLE': new FormControl(dataItem.TITLE),
            'REPORTING_DATE': new FormControl(dataItem.REPORTING_DATE),
            'CODE_CONVERSION': new FormControl(dataItem.CODE_CONVERSION),
            'PROJECT_MANAGER': new FormControl(dataItem.PROJECT_MANAGER),
            'IBM_PROJECT_LEAD': new FormControl(dataItem.IBM_PROJECT_LEAD),
            'IBM_TECHNICAL_LEAD': new FormControl(dataItem.IBM_TECHNICAL_LEAD),
            'STATUS': new FormControl(dataItem.STATUS),
            'PROJECT_HEALTH': new FormControl(dataItem.PROJECT_HEALTH),
            'RISK': new FormControl(dataItem.RISK),
            'ISSUE': new FormControl(dataItem.ISSUE),
            'DELIVERABLE': new FormControl(dataItem.DELIVERABLE),
            'FIRST_MILESTONE': new FormControl(dataItem.FIRST_MILESTONE),
            'EFFORT': new FormControl(dataItem.EFFORT),
            'DEFECT_DEPENDENCY': new FormControl(dataItem.DEFECT_DEPENDENCY),
            'REPORTINGWEEK': new FormControl(),
            'PHASE': new FormControl(dataItem.PHASE),
            'MILESTONE_END_DATE': new FormControl(dataItem.MILESTONE_END_DATE),
            'DELIVERABLE1': new FormControl(dataItem.DELIVERABLE1),
            'BASELINE_EFFORT_FTE': new FormControl(dataItem.BASELINE_EFFORT_FTE),
            'ACTUAL_EFFORT_FTE': new FormControl(dataItem.ACTUAL_EFFORT_FTE),
            'ETC': new FormControl(dataItem.ETC),
            'EAC': new FormControl(dataItem.EAC),
            'SIT': new FormControl(dataItem.SIT),
            'UAT': new FormControl(dataItem.UAT),
            'PROD': new FormControl(dataItem.PROD),
            'BASELINE': new FormControl(dataItem.BASELINE),
            'ACTUALS': new FormControl(dataItem.ACTUALS),
            'ETC1': new FormControl(dataItem.ETC1),
            'EAC1': new FormControl(dataItem.EAC1),
            'COMMENTS': new FormControl(dataItem.COMMENTS),
            'RISK1': new FormControl(dataItem.RISK1),
            'ISSUE1': new FormControl(dataItem.ISSUE1),
            'DELIVERABLE2': new FormControl(dataItem.DELIVERABLE2),
            'SECOND_MILESTONE': new FormControl(dataItem.SECOND_MILESTONE),
            'EFFORT1': new FormControl(dataItem.EFFORT1),
            'DEFECT_DEPENDENCY1': new FormControl(dataItem.DEFECT_DEPENDENCY1),
            'CR': new FormControl(dataItem.CR),
            'PIR_Duration': new FormControl(dataItem.PIR_Duration),
            'Planned_Activities': new FormControl()
        });
        this.editedRowIndex = rowIndex;
        sender.editRow(rowIndex, this.formGroup);
    }
    public cellClickHandler($event): void {
        if (this.hidden) {
            this.hidden = !this.hidden;
        }
    }

    public cancelHandler({ sender, rowIndex }) {
        this.closeEditor(sender, rowIndex);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }) {
        const record: Reports = formGroup.value;

        if ((record.RISK1 == null || record.RISK1 == undefined || record.RISK1.length == 0) &&
            (record.ISSUE1 == null || record.ISSUE1 == undefined || record.ISSUE1.length == 0) &&
            (record.DELIVERABLE2 == null || record.DELIVERABLE2 == undefined || record.DELIVERABLE2.length == 0) &&
            (record.SECOND_MILESTONE == null || record.SECOND_MILESTONE == undefined || record.SECOND_MILESTONE.length == 0) &&
            (record.EFFORT1 == null || record.EFFORT1 == undefined || record.EFFORT1.length == 0) &&
            (record.DEFECT_DEPENDENCY1 == null || record.DEFECT_DEPENDENCY1 == undefined || record.DEFECT_DEPENDENCY1.length == 0)) {
            record.RISK = "G";
            record.ISSUE = "G";
            record.DELIVERABLE = "G";
            record.FIRST_MILESTONE = "G";
            record.EFFORT = "G";
            record.DEFECT_DEPENDENCY = "G";
        }
        else {
            if (record.RISK1 != null && record.RISK1 != undefined && record.RISK1.length > 0) {
                if (record.RISK == 'G') {
                    record.RISK = 'R'
                }
            }
            else {
                record.RISK = 'G'
            }

            if (record.ISSUE1 != null && record.ISSUE1 != undefined && record.ISSUE1.length > 0) {
                if (record.ISSUE == 'G') {
                    record.ISSUE = 'R'
                }
            }
            else {
                record.ISSUE = 'G'
            }

            if (record.DELIVERABLE2 != null && record.DELIVERABLE2 != undefined && record.DELIVERABLE2.length > 0) {
                if (record.DELIVERABLE == 'G') {
                    record.DELIVERABLE = 'R'
                }
            }
            else {
                record.DELIVERABLE = 'G'
            }

            if (record.SECOND_MILESTONE != null && record.SECOND_MILESTONE != undefined && record.SECOND_MILESTONE.length > 0) {
                if (record.FIRST_MILESTONE == 'G') {
                    record.FIRST_MILESTONE = 'R'
                }
            }
            else {
                record.FIRST_MILESTONE = 'G'
            }

            if (record.EFFORT1 != null && record.EFFORT1 != undefined && record.EFFORT1.length > 0) {
                if (record.EFFORT == 'G') {
                    record.EFFORT = 'R'
                }
            }
            else {
                record.EFFORT = 'G'
            }

            if (record.DEFECT_DEPENDENCY1 != null && record.DEFECT_DEPENDENCY1 != undefined && record.DEFECT_DEPENDENCY1.length > 0) {
                if (record.DEFECT_DEPENDENCY == null) {
                    record.DEFECT_DEPENDENCY = 'G'
                }
                else if (record.DEFECT_DEPENDENCY == 'G') {
                    record.DEFECT_DEPENDENCY = 'R'
                }
            }
            else {
                record.DEFECT_DEPENDENCY = 'G'
            }
        }

        if (record.RISK == 'G' && record.ISSUE == 'G' && record.DELIVERABLE == 'G' && record.FIRST_MILESTONE == 'G' && record.EFFORT == 'G' && record.DEFECT_DEPENDENCY == 'G') {
            record.PROJECT_HEALTH = "G";
        }
        else if (record.RISK == 'Y' || record.ISSUE == 'Y' || record.DELIVERABLE == 'Y' || record.FIRST_MILESTONE == 'Y' || record.EFFORT == 'Y' || record.DEFECT_DEPENDENCY == 'Y') {
            record.PROJECT_HEALTH = "Y";
        }
        else {
            record.PROJECT_HEALTH = "R";
        }


        let temp: any;
        let currentweek: any = new Date;
        var first = currentweek.getDate() - currentweek.getDay();
        var last = first + 5;
        currentweek = new Date(currentweek.setDate(last));
        currentweek = this._datepipe.transform(currentweek, 'yyyy-MM-dd');
        temp = {
            SDN_eSDN: record.SDN_eSDN != null && record.SDN_eSDN != undefined ? record.SDN_eSDN : null,
            SDN_No: record.SDN_No != null && record.SDN_No != undefined ? record.SDN_No : null,
            TITLE: record.TITLE != null && record.TITLE != undefined ? record.TITLE : null,
            REPORTING_DATE: currentweek,
            CODE_CONVERSION: record.CODE_CONVERSION != null && record.CODE_CONVERSION != undefined ? record.CODE_CONVERSION : null,
            PROJECT_MANAGER: record.PROJECT_MANAGER != null && record.PROJECT_MANAGER != undefined ? record.PROJECT_MANAGER : null,
            IBM_PROJECT_LEAD: record.IBM_PROJECT_LEAD != null && record.IBM_PROJECT_LEAD != undefined ? record.IBM_PROJECT_LEAD : null,
            IBM_TECHNICAL_LEAD: record.IBM_TECHNICAL_LEAD != null && record.IBM_TECHNICAL_LEAD != undefined ? record.IBM_TECHNICAL_LEAD : null,
            STATUS: record.STATUS != null && record.STATUS != undefined ? record.STATUS : null,
            PROJECT_HEALTH: record.PROJECT_HEALTH != null && record.PROJECT_HEALTH != undefined ? record.PROJECT_HEALTH : null,
            RISK: record.RISK != null && record.RISK != undefined ? record.RISK : null,
            ISSUE: record.ISSUE != null && record.ISSUE != undefined ? record.ISSUE : null,
            DELIVERABLE: record.DELIVERABLE != null && record.DELIVERABLE != undefined ? record.DELIVERABLE : null,
            FIRST_MILESTONE: record.FIRST_MILESTONE != null && record.FIRST_MILESTONE != undefined ? record.FIRST_MILESTONE : null,
            EFFORT: record.EFFORT != null && record.EFFORT != undefined ? record.EFFORT : null,
            DEFECT_DEPENDENCY: record.DEFECT_DEPENDENCY != null && record.DEFECT_DEPENDENCY != undefined ? record.DEFECT_DEPENDENCY : null,
            REPORTINGWEEK: record.REPORTINGWEEK != null && record.REPORTINGWEEK != undefined ? record.REPORTINGWEEK : null,
            PHASE: record.PHASE != null && record.PHASE != undefined ? record.PHASE : null,
            MILESTONE_END_DATE: record.MILESTONE_END_DATE != null && record.MILESTONE_END_DATE != undefined ? record.MILESTONE_END_DATE : null,
            DELIVERABLE1: record.DELIVERABLE1 != null && record.DELIVERABLE1 != undefined ? record.DELIVERABLE1 : null,
            BASELINE_EFFORT_FTE: record.BASELINE_EFFORT_FTE != null && record.BASELINE_EFFORT_FTE != undefined ? record.BASELINE_EFFORT_FTE : null,
            ACTUAL_EFFORT_FTE: record.ACTUAL_EFFORT_FTE != null && record.ACTUAL_EFFORT_FTE != undefined ? record.ACTUAL_EFFORT_FTE : null,
            ETC: record.ETC != null && record.ETC != undefined ? record.ETC : null,
            EAC: record.EAC != null && record.EAC != undefined ? record.EAC : null,
            SIT: record.SIT != null && record.SIT != undefined ? record.SIT : null,
            UAT: record.UAT != null && record.UAT != undefined ? record.UAT : null,
            PROD: record.PROD != null && record.PROD != undefined ? record.PROD : null,
            BASELINE: record.BASELINE != null && record.BASELINE != undefined ? record.BASELINE : null,
            ACTUALS: record.ACTUALS != null && record.ACTUALS != undefined ? record.ACTUALS : null,
            ETC1: record.ETC1 != null && record.ETC1 != undefined ? record.ETC1 : null,
            EAC1: record.EAC1 != null && record.EAC1 != undefined ? record.EAC1 : null,
            COMMENTS: record.COMMENTS != null && record.COMMENTS != undefined ? record.COMMENTS : null,
            RISK1: record.RISK1 != null && record.RISK1 != undefined ? record.RISK1 : null,
            ISSUE1: record.ISSUE1 != null && record.ISSUE1 != undefined ? record.ISSUE1 : null,
            DELIVERABLE2: record.DELIVERABLE2 != null && record.DELIVERABLE2 != undefined ? record.DELIVERABLE2 : null,
            SECOND_MILESTONE: record.SECOND_MILESTONE != null && record.SECOND_MILESTONE != undefined ? record.SECOND_MILESTONE : null,
            EFFORT1: record.EFFORT1 != null && record.EFFORT1 != undefined ? record.EFFORT1 : null,
            DEFECT_DEPENDENCY1: record.DEFECT_DEPENDENCY1 != null && record.DEFECT_DEPENDENCY1 != undefined ? record.DEFECT_DEPENDENCY1 : null,
            CR: record.CR != null && record.CR != undefined ? record.CR : null,
            PIR_Duration: record.PIR_Duration != null && record.PIR_Duration != undefined ? record.PIR_Duration : null,
            Planned_Activities: record.Planned_Activities != null && record.Planned_Activities != undefined ? record.Planned_Activities : null
        }
        var url = "http://localhost:4000/";

        var RecordCheck = this.EXcelData.filter(a => a.REPORTING_DATE == temp.REPORTING_DATE && a.SDN_No == temp.SDN_No);
        if (RecordCheck != undefined && RecordCheck != null && RecordCheck.length > 0) {
            temp['_id'] = RecordCheck[0]._id;
            this._http.post(url + 'update', temp, this.options).subscribe((result) => {
                var res = result;
                if (res.ok) {
                    this.EXcelData = [];
                    this.SelectedData = [];
                    this.gridData = process(this.SelectedData, this.gridState);
                    setTimeout(() => { this.getData() }, 2);
                }
            }), catchError(error => {
                return throwError('Something went wrong!');
            });
        }
        else {
            this._http.post(url + 'add', temp, this.options).subscribe((result) => {
                var res = result;
                if (res.ok) {
                    this.EXcelData = [];
                    this.SelectedData = [];
                    this.gridData = process(this.SelectedData, this.gridState);
                    setTimeout(() => { this.getData() }, 2);
                }
            }), catchError(error => {
                return throwError('Something went wrong!');
            });
        }

        sender.closeRow(rowIndex);
    }

    public removeHandler({ dataItem }) {
        var url = "http://localhost:4000/delete";
        let temp: any[] = [];
        temp.push(dataItem);
        this._http.post(url, temp[0], this.options).subscribe((result) => {
            let res = result;
            if (res.ok) {
                this.EXcelData = [];
                this.SelectedData = [];
                this.gridData = process(this.SelectedData, this.gridState);
                //location.reload(true);
                setTimeout(() => { this.getData() }, 2);
            }
        }), catchError(error => {
            return throwError('Something went wrong!');
        });
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    public options = new RequestOptions({ headers: this.getHeaders() });

    public colorCode(code: string): SafeStyle {
        let result: any;

        switch (code) {
            case 'G':
                result = '#B2F699';
                break;
            case 'R':
                result = '#FFBA80';
                break;
            case 'Y':
                result = '#F6F531';
                break;
            default:
                result = 'transparent';
                break;
        }

        return this.sanitizer.bypassSecurityTrustStyle(result);
    }

    public colorweekCode(code: string): SafeStyle {
        let result: any;

        switch (code) {
            case this._CurrentWeek:
                result = '#42f4eb';
                break;
            default:
                result = 'transparent';
                break;
        }

        return this.sanitizer.bypassSecurityTrustStyle(result);
    }

    public DropdownData() {
        var temp = this.EXcelData.filter(obj => {
            return obj.REPORTING_DATE === this.defaultItem && obj.PROJECT_HEALTH === 'G'
        });
        this._CGR = temp.length;

        temp = this.EXcelData.filter(obj => {
            return obj.REPORTING_DATE === this.defaultItem && obj.PROJECT_HEALTH === 'Y'
        });
        this._CYR = temp.length;

        temp = this.EXcelData.filter(obj => {
            return obj.REPORTING_DATE === this.defaultItem && obj.PROJECT_HEALTH === 'R'
        });
        this._CRR = temp.length;

        this.DonutData = [
            { category: 'Red', value: this._CRR },
            { category: 'Yellow', value: this._CYR },
            { category: 'Green', value: this._CGR }
        ];

        this.SDNPhaseCount();
        this.SDNEffortCount();
    }

    public labelContent(e: any): string {
        return e.category + "  " + e.value;
    }


    public bardata() {
        for (let item of this._categories) {
            var weekdata = this.EXcelData.filter(obj => {
                return obj.REPORTING_DATE === item
            });

            let temp1 = weekdata.filter(obj => {
                return obj.PROJECT_HEALTH === 'G'
            });

            this._GR.push(temp1.length.toString());

            let temp2 = weekdata.filter(obj => {
                return obj.PROJECT_HEALTH === 'R'
            });

            this._RR.push(temp2.length.toString());

            let temp3 = weekdata.filter(obj => {
                return obj.PROJECT_HEALTH === 'Y'
            });

            this._YR.push(temp3.length.toString());
        }
    }

    public SelectDate(event: any) {
        this.CurrentHealth = null;
        this.defaultItem = event;
        this.DropdownData();
    }

    public displaygrid(event: any) {
        if (this.CurrentHealth != null && this.CurrentHealth != undefined) {
            if (this.CurrentHealth == event) {
                this.Showgrid = false;
                this.CurrentHealth = null;
                return;
            }
            else {
                this.CurrentHealth = event;
            }
        }
        else {
            this.CurrentHealth = event;
        }

        this.Showgrid = true;
        this._reports = this.EXcelData.filter(obj => {
            return obj.REPORTING_DATE === this.defaultItem && obj.PROJECT_HEALTH === event
        });

        this.gridOVData = process(this._reports, this.gridOVState);
    }

    public CRUDOperation(dataItem: any, isNew: any) {
        if (isNew) {
            return true;
        }
        if (this.SelectedData.length > 0) {
            let temp: any = this.SelectedData.filter(a => dataItem.SDN_No === a.SDN_No && dataItem.REPORTING_DATE === a.REPORTING_DATE);
            if (temp.length > 0) {
                return true;;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }

    }

    public SDNPhaseCount() {
        var data: any = this.EXcelData.filter(a => a.REPORTING_DATE == this.defaultItem);
        var SFD1020: any = 0; var TSD: any = 0; var CUTUIT: any = 0; var SITUAT: any = 0; var PIR: any = 0;
        var SFD1020per: any = 0; var TSDper: any = 0; var CUTUITper: any = 0; var SITUATper: any = 0; var PIRper: any = 0;
        data.forEach(ele => {
            var phase = ele.PHASE.toUpperCase();
            if (phase.includes('10/20/SFD')) {
                SFD1020++;
            } else if (phase.includes('TSD')) {
                TSD++;
            } else if (phase.includes('CUT/UIT')) {
                CUTUIT++;
            } else if (phase.includes('SIT/UAT')) {
                SITUAT++;
            } else if (phase.includes('PIR')) {
                PIR++;
            }
        });
        var Total: any = SFD1020 + TSD + CUTUIT + SITUAT + PIR;
        this.sdnphasetotal = Total;
        SFD1020per = SFD1020 / Total;
        TSDper = TSD / Total;
        CUTUITper = CUTUIT / Total;
        SITUATper = SITUAT / Total;
        PIRper = PIR / Total;

        this.DonutSDNPhase = [
            { category: '10/20/SFD', value: SFD1020 },
            { category: 'TSD', value: TSD },
            { category: 'CUT/UIT', value: CUTUIT },
            { category: 'SIT/UAT', value: SITUAT },
            { category: 'PIR', value: PIR }
        ];
    }

    public labelPhaseffContent(e: any): string {
        if (e != null && e != undefined) {
            return e.value + ', ' + Number((e.percentage * 100).toFixed()) + '%';
        }
    }

    public SDNEffortCount() {
        var data: any = this.EXcelData.filter(a => a.REPORTING_DATE == this.defaultItem);
        var SFD1020: number = 0; var TSD: number = 0; var CUTUIT: number = 0; var SITUAT: number = 0; var PIR: number = 0;
        var SFD1020per: any = 0; var TSDper: any = 0; var CUTUITper: any = 0; var SITUATper: any = 0; var PIRper: any = 0;
        data.forEach(ele => {
            if (ele.BASELINE_EFFORT_FTE != null && ele.ACTUAL_EFFORT_FTE != null) {
                if (ele.BASELINE_EFFORT_FTE.toUpperCase() != 'TBD' && ele.ACTUAL_EFFORT_FTE.toUpperCase() != 'TBD') {
                    var phase = ele.PHASE.toUpperCase();
                    if (phase.includes('10/20/SFD')) {
                        SFD1020 += +ele.BASELINE_EFFORT_FTE//+ +ele.ACTUAL_EFFORT_FTE;
                    } else if (phase.includes('TSD')) {
                        TSD += +ele.BASELINE_EFFORT_FTE//+ +ele.ACTUAL_EFFORT_FTE;
                    } else if (phase.includes('CUT/UIT')) {
                        CUTUIT += +ele.BASELINE_EFFORT_FTE//+ +ele.ACTUAL_EFFORT_FTE;;
                    } else if (phase.includes('SIT/UAT')) {
                        SITUAT += +ele.BASELINE_EFFORT_FTE//+ +ele.ACTUAL_EFFORT_FTE;;
                    } else if (phase.includes('PIR')) {
                        PIR += +ele.BASELINE_EFFORT_FTE//+ +ele.ACTUAL_EFFORT_FTE;;
                    }
                }
            }
        });
        var Total: any = SFD1020 + TSD + CUTUIT + SITUAT + PIR;
        this.sdneffortotal = Total;
        SFD1020per = SFD1020 / Total;
        TSDper = TSD / Total;
        CUTUITper = CUTUIT / Total;
        SITUATper = SITUAT / Total;
        PIRper = PIR / Total;

        this.DonutSDNEffort = [
            { category: '10/20/SFD', value: SFD1020 },
            { category: 'TSD', value: TSD },
            { category: 'CUT/UIT', value: CUTUIT },
            { category: 'SIT/UAT', value: SITUAT },
            { category: 'PIR', value: PIR }
        ];

    }

    public linedataset() {
        let index = 0;
        for (var item of this._DatesList.reverse()) {
            if (index < 5) {
                this._categories.push(item);
            }
            else {
                break;
            }
            index++
        }
        for (let index = 0; index < 5; index++) {
            this.linedata[index] = [];
        }
        this._categories.forEach(ele => {
            var data: any = this.EXcelData.filter(a => a.REPORTING_DATE == ele);
            var SFD1020: any = 0; var TSD: any = 0; var CUTUIT: any = 0; var SITUAT: any = 0; var PIR: any = 0;
            data.forEach(ele => {
                var phase = ele.PHASE.toUpperCase();
                if (phase.includes('10/20/SFD')) {
                    SFD1020++;
                } else if (phase.includes('TSD')) {
                    TSD++;
                } else if (phase.includes('CUT/UIT')) {
                    CUTUIT++;
                } else if (phase.includes('SIT/UAT')) {
                    SITUAT++;
                } else if (phase.includes('PIR')) {
                    PIR++;
                }
            });
            this.linedata[0].push(SFD1020);
            this.linedata[1].push(TSD);
            this.linedata[2].push(CUTUIT);
            this.linedata[3].push(SITUAT);
            this.linedata[4].push(PIR);
        });
    }
}
