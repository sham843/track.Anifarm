import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
declare const ExcelJS: any;
import { DatePipe } from '@angular/common';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})

export class ExcelService {

  constructor(private _datePipe: DatePipe) { }


  downLoadPdf(header: any, key: any, rows: any, formDataObj: any) {
    let result: any = rows.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < key.length; i++) {
        filterObj[key[i]] = obj[key[i]];
      }
      return filterObj;
    });
    let conMulArray: any;
    conMulArray = result.map((o: any) => Object.keys(o).map(k => o[k]));

    let doc: any = new jsPDF();

    // style pdf
    let todayDate: any = new Date();
    let fromDatePipe: any;
    let toDatePipe: any;

    if (formDataObj.pageName == "Speed Range Report") {
      fromDatePipe = this._datePipe.transform(formDataObj.fromDate, 'dd-MM-YYYY hh:mm a')
      toDatePipe = this._datePipe.transform(formDataObj.toDate, 'dd-MM-YYYY hh:mm a')
      todayDate = this._datePipe.transform(todayDate, 'dd-MM-YYYY')
      doc.setFontSize(13);
      doc.text(formDataObj.pageName, 105, 10, "center");
      doc.setFontSize(8);
      doc.text("Date : " + todayDate, 200, 10, "right");
      doc.text(8, 10, "From : " + fromDatePipe, "left");
      doc.text(47, 10, "To : " + toDatePipe, "left");
      // doc.setFontSize(12);
    }
    else {
      fromDatePipe = this._datePipe.transform(formDataObj.fromDate, 'dd-MM-YYYY')
      toDatePipe = this._datePipe.transform(formDataObj.toDate, 'dd-MM-YYYY')
      todayDate = this._datePipe.transform(todayDate, 'dd-MM-YYYY')
      doc.setFontSize(14);
      doc.text(formDataObj.pageName, 105, 10, "center");
      doc.setFontSize(10);
      doc.text("Date : " + todayDate, 200, 10, "right");
      doc.text(8, 10, "From : " + fromDatePipe, "left");
      doc.text(40, 10, "To : " + toDatePipe, "left");
    }
    doc.setLineWidth(0.2);
    doc.line(8, 15, 200, 15);

    if (formDataObj.VehicleNumber) {
      doc.text(8, 20, "Vehicle  : " + formDataObj.VehicleNumber + " (" + formDataObj.vehName + ")")
    }
    if (formDataObj.pageName == "Speed Range Report") {
      doc.text("Speed : " + formDataObj.SpeedfromRange + " Km/h To " + formDataObj.SpeedToRange + " Km/h", 200, 20, "right");
    }
    doc.autoTable(header,conMulArray,{
      // head:header, 
      // body:conMulArray, 
      startY: 25,
      margin: { horizontal: 7 },
      // styles: { columnWidth: 'wrap' },
      // columnStyles: { text: { columnWidth: 'auto' } }
    });
    doc.save(formDataObj.pageName);
  }



  exportAsExcelFile(key: any, headersArray: any, json: any, formDataObj: any) {
    let keyCenterNo = ""
    if (key.length == 2) {
      keyCenterNo = "B"
    } else {
      keyCenterNo = String.fromCharCode(Math.ceil(key.length / 2) + 64)
    }
    const header = key;
    let result: any = json.map((obj: any) => {
      let filterObj: any = {};
      for (let i: any = 0; i < headersArray.length; i++) {
        filterObj[headersArray[i]] = obj[headersArray[i]];
      }
      return filterObj;
    });
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Snippet Coder';
    workbook.lastModifiedBy = 'SnippetCoder';
    workbook.created = new Date();
    workbook.modified = new Date();
    const worksheet = workbook.addWorksheet(formDataObj.pageName);
    // Adding Header Row
    worksheet.addRow([]);
    worksheet.mergeCells(keyCenterNo + '2:' + this.numToAlpha(header.length - 2) + '2');
    worksheet.getCell(keyCenterNo + '2').value = formDataObj.pageName;
    worksheet.getCell(keyCenterNo + '2').alignment = { horizontal: 'center' };
    worksheet.getCell(keyCenterNo + '2').font = { size: 15, bold: true };

    if (formDataObj.pageName == "Speed Range Report") {
      worksheet.mergeCells(keyCenterNo + '3:' + this.numToAlpha(header.length - 3) + '3');
      worksheet.getCell(keyCenterNo + '3').value = "Speed : " + formDataObj.SpeedfromRange + " " + " Km/h To " + formDataObj.SpeedToRange + " Km/h";
      worksheet.getCell(keyCenterNo + '3').alignment = { horizontal: 'center' };
      worksheet.getCell(keyCenterNo + '3').font = { size: 12 };
    } else {
      worksheet.addRow([]);
    }

    worksheet.mergeCells(keyCenterNo + '4:' + this.numToAlpha(header.length - 4) + '4');
    worksheet.getCell(keyCenterNo + '4').value = "From : " + this._datePipe.transform(formDataObj.fromDate, 'dd-MM-YYYY hh:mm a') + " " + "  To  : " + this._datePipe.transform(formDataObj.toDate, 'dd-MM-YYYY hh:mm a');
    worksheet.getCell(keyCenterNo + '4').alignment = { horizontal: 'center' };
    worksheet.getCell(keyCenterNo + '4').font = { size: 12 };

    if (formDataObj.VehicleNumber) {
      worksheet.mergeCells(keyCenterNo + '5:' + this.numToAlpha(header.length - 5) + '5');
      worksheet.getCell(keyCenterNo + '5').value = "Vehicle : " + formDataObj.VehicleNumber + " (" + formDataObj.vehName + ")";
      worksheet.getCell(keyCenterNo + '5').alignment = { horizontal: 'center' };
      worksheet.getCell(keyCenterNo + '5').font = { size: 12 };
    }
    worksheet.mergeCells(keyCenterNo + '6:' + this.numToAlpha(header.length - 6) + '6');
    worksheet.getCell(keyCenterNo + '6').value = "Date : " + this._datePipe.transform(workbook.created, 'dd-MM-yyyy')
    worksheet.getCell(keyCenterNo + '6').alignment = { horizontal: 'center' };
    worksheet.getCell(keyCenterNo + '6').font = { size: 12 };

    worksheet.addRow([]);

    //Add Header Row

    //Cell Style : Fill And Border

    const headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell: any, index: any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: 'FFFFFFFF'
        },
        bgColor: {
          argb: 'FFFFFFFF'
        },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.font = { size: 12, bold: true }
      worksheet.getColumn(index).width = header[index - 1].length < 20 ? 20 : header[index - 1].length;

    });

    //Add Data Conditional Formating
    result.forEach((element: any) => {
      const eachRow: any = [];
      headersArray.forEach((column: any) => {
        eachRow.push(element[column]);
      })
      // if (element.isDeleted === 'Y') {
      const deletedRow = worksheet.addRow(eachRow);
      deletedRow.eachCell((cell: any) => {
        cell.font = {
          align: 'left'
        };
        cell.alignment = {
          vertical: 'middle', horizontal: 'left'
        };
        cell.border = {
          top: { style: 'thin' },
          left: { tyle: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      // }
      // worksheet.addRow(eachRow);

    });
    workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
      const blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, formDataObj.pageName + EXCEL_EXTENSION);
    });
  }

  private numToAlpha(num: number) {
    let alpha = '';
    return alpha;
  }

  downLoadPaymentReceipt(receipt:any){
    var doc = new jsPDF();
    var elem = document.getElementById("Receipt");
    doc.save("table.pdf");
  }
}

