import { Injectable } from '@angular/core';
@Injectable()
export class global {
    public validate: string = "Non-Validate";

    public setvalue(value: any) {
        this.validate = value.toUpperCase();
    }
}


export class Reports {
    public _id: string;
    public SDN_eSDN: string;
    public SDN_No: string;
    public TITLE: string;
    public REPORTING_DATE: string;
    public CODE_CONVERSION: string;
    public PROJECT_MANAGER: string;
    public IBM_PROJECT_LEAD: string;
    public IBM_TECHNICAL_LEAD: string;
    public STATUS: string;
    public PROJECT_HEALTH: string;
    public RISK: string;
    public ISSUE: string;
    public DELIVERABLE: string;
    public FIRST_MILESTONE: string;
    public EFFORT: string;
    public DEFECT_DEPENDENCY: string;
    public REPORTINGWEEK: string;
    public PHASE: string;
    public MILESTONE_END_DATE: string;
    public DELIVERABLE1: string;
    public BASELINE_EFFORT_FTE: string;
    public ACTUAL_EFFORT_FTE: string;
    public ETC: string;
    public EAC: string;
    public SIT: string;
    public UAT: string;
    public PROD: string;
    public BASELINE: string;
    public ACTUALS: string;
    public ETC1: string;
    public EAC1: string;
    public COMMENTS: string;
    public RISK1: string;
    public ISSUE1: string;
    public DELIVERABLE2: string;
    public SECOND_MILESTONE: string;
    public EFFORT1: string;
    public DEFECT_DEPENDENCY1: string;
    public CR: string;
    public PIR_Duration: string;
    public Planned_Activities: string;
}

export class Vacation {
    public _id: string;
    public Enter_Vacation_Dates: string;
    public Classification: string;
    public Name: string;
    public Request_Date: string;
    public Manager_Approval_Date: string;
    public Manager_Name: string;
    public Total_Hours: string;
    public Vacation_Days: string;
}
