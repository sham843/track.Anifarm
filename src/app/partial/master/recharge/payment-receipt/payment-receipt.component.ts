import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ExcelService } from 'src/app/services/excel_Pdf.service';
import { jsPDF } from 'jspdf';
// import * as jspdf from 'jspdf';  
import html2canvas from 'html2canvas'
import { CommonService } from 'src/app/services/common.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-payment-receipt',
  templateUrl: './payment-receipt.component.html',
  styleUrls: ['./payment-receipt.component.css']
})
export class PaymentReceiptComponent implements OnInit, OnDestroy {
  default: boolean = false;
  paymentData: any;
  todayDate: any = new Date();
  vachileRes: any;
  vehicleNo: any;
  vechLength: any;
  veckInfoArray: any = [];
  @ViewChild('ticket') ticket!: ElementRef; 
  constructor(private excelService: ExcelService,
    private route: ActivatedRoute, private router: Router,
    private _commonService: CommonService,
    private _datePipe: DatePipe,
    private decimalPipe:DecimalPipe) {
    let getLocalStorageData: any = localStorage.getItem('payment');
    if (!getLocalStorageData) {
      this.router.navigate(['/recharge']);
    }
     this.paymentData = JSON.parse(getLocalStorageData);
    
  }



  ngOnInit(): void {
    // this.getVechNumberById()
    this.todayDate = this._datePipe.transform(this.todayDate, 'dd-MM-YYYY hh:mm a');

      this.createVechArray();

  }

  createVechArray() {
    let splitData = this.paymentData.udf5.split('$')
    this.vechLength = splitData['0'];
    for (let i = 1; i <= this.vechLength; i++) {
      // if (this.vechLength == 1) {
      //   this.veckInfoArray.push({ "basicAmount": splitData[1], "GST": splitData[2], "transactionCost": splitData[3], "amount": this.paymentData.amount, "vehicleNo": this.paymentData.vechileNo[0] })
      //   console.log(this.veckInfoArray);
      // }
      // else {
          let counter = i - 1;
          let basicAmountCal = (splitData[1] / this.vechLength);
          let GSTCal = (splitData[2] / this.vechLength);
          let transactionCostCal = (splitData[3] / this.vechLength);
          // let amountCal = (this.paymentData.amount / this.vechLength);
          let amountCal = basicAmountCal + GSTCal + transactionCostCal;
          // this.veckInfoArray.push({"Sr_No":i, "basicAmount":this.decimalPipe.transform(basicAmountCal, '1.2-2'), "GST":this.decimalPipe.transform(GSTCal, '1.2-2'), "transactionCost":this.decimalPipe.transform(transactionCostCal, '1.2-2') , "amount":this.decimalPipe.transform(amountCal, '1.2-2'), "vehicleNo":this.paymentData.vechileNo[counter]})
          this.veckInfoArray.push({"Sr_No":i, "basicAmount":basicAmountCal, "GST":GSTCal, "transactionCost":transactionCostCal , "amount":amountCal, "vehicleNo":this.paymentData.vechileNo[counter]})

      // }
      // this.veckInfoArray.push({"basicAmount":splitData[i],"GST": })
    }
  }


  downLoadPayReceipt() {
    let doc: any = new jsPDF('p', 'mm', 'a4');
    let todayDate: any = new Date();
    doc.setFontSize(18);
    // doc.setTextColor(255,0,0);
    doc.text("Invoice", 8, 10, "left");
    doc.setFontSize(10);
  
    // doc.setTextColor(255,0,0);
    // doc.addImage('https://fit.ae/assets/images/frontline-logo-header.png', 'PNG', 0, 0, 100, 50);
    doc.text("Transaction Id : " + this.paymentData?.txnid, 200, 10, "right");
    doc.text("Payment Date : " + this._datePipe.transform(this.paymentData?.addedon, 'dd-MM-YYYY hh:mm a'), 200, 15, "right");
    doc.setLineWidth(0.1);
    doc.line(8, 20, 200, 20);

    doc.text("Client Information", 8, 33, "left");
    doc.text("Name : "+ this.paymentData.firstname, 8, 40, "left");
    doc.text("Mobile No : " + this.paymentData?.phone, 8, 45, "left");
    // doc.text("Email : " +this.paymentData.phone, 8,50, "left");
    doc.text("Email : " +this.paymentData.email, 8, 50, "left");
    doc.text("GST No. : " + (this.paymentData.GSTNo ? this.paymentData.GSTNo : 'NA'), 8, 55, "left");


    doc.text("Payment Details", 200, 33, "right");
    doc.text("Payment Status : "+ this.paymentData.status, 200, 40, "right");
    doc.text("Payu Money Id : " +this.paymentData.payuMoneyId, 200,45, "right");
    doc.text("Payment Type: " +this.paymentData.PG_TYPE, 200, 50, "right");
    doc.text("Bank Ref No.: " +this.paymentData.bank_ref_num, 200, 55, "right");
    doc.setFontSize(14);
    doc.text("Total Amount : " +this.paymentData?.amount, 200, 77, "right");
    doc.setFontSize(10);
    let header:any = ["Sr No.","Vechile No", "Basic Amount","GST"+ " ("+this.paymentData.GSTPer+"%)","Transaction Cost"+ " ("+this.paymentData.transactionPer+"%)","Total"];
    let key = ['Sr_No','vehicleNo','basicAmount', 'GST','transactionCost','amount'];

    let result: any = this.veckInfoArray.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < key.length; i++) {
        filterObj[key[i]] = obj[key[i]];
      }
      return filterObj;
    });
    let conMulArray: any;
    conMulArray = result.map((o: any) => Object.keys(o).map(k => o[k]));

    doc.autoTable(header, conMulArray, {
      startY: doc.autoTableEndPosY() + 80,
      margin: { horizontal: 7 },
      styles: { columnWidth: 'wrap' },
      columnStyles: { text: { columnWidth: 'auto' } }
    });

    doc.save("Invoice_"+this._datePipe.transform(todayDate, 'dd_MM_YYYY_hh:mms'));

    // let DATA: any = document.getElementById('printInvoice');
    // html2canvas(DATA).then(canvas => {

    //   let fileWidth = 100;
    //   let fileHeight = canvas.height * fileWidth / canvas.width;

    //   const FILEURI = canvas.toDataURL('image/png')
    //   let PDF: any = new jsPDF('p', 'mm', 'a4');
    //   PDF.setFontSize(18);
    //   PDF.text("Invoice", 105, 10, "center");
    //   PDF.text("Date : " + this.todayDate, 200, 10, "right");
    //   PDF.setLineWidth(0.1);
    //   PDF.rect(45, 35, 113, 118);
    //   let position = 40; // top
    //   PDF.addImage(FILEURI, 'PNG', 50, position, fileWidth, fileHeight)
    //   PDF.save('Invoice.pdf');
    // });

  }


  redirectRecharge() {
    this.router.navigate(['../recharge']);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('payment');
  }
}
