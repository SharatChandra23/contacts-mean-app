import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from "rxjs";
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
//declare let jsPDF;
import 'jspdf-autotable';
import { autoTable as AutoTable } from 'jspdf-autotable';
import { Base64_ } from 'js-base64';

@Injectable()
export class UploadService {

  constructor(private http: HttpClient) { }

  // file from event.target.files[0]
  uploadFile(url: string, file: File): Observable<HttpEvent<any>> {

    let formData = new FormData();
    formData.append('upload', file);

    let params = new HttpParams();

    const options = {
      params: params,
      reportProgress: true,
    };

    const req = new HttpRequest('POST', url, formData, options);
    return this.http.request(req);
  }

  generateTablePDF(pdfObj) {

    let tblIdElement = <HTMLElement>document.getElementById(pdfObj.tblId);
    html2canvas(tblIdElement)
      .then((canvas) => {

        let comapnyJSON = {
          CompanyName: pdfObj.businessUserDetails.businessName,
          Proprietor: (pdfObj.businessUserDetails.ownername || ""),
          CompanyGSTIN: '37B76C238B7E1Z5',
          docType: pdfObj.businessUserDetails.regDocType,
          docDetails: pdfObj.businessUserDetails.regDocId,
          CompanyState: pdfObj.businessUserDetails.state,
          CompanyAddressLine1: pdfObj.businessUserDetails.businessAddress,
          CompanyAddressLine2: pdfObj.businessUserDetails.city,
          CompanyAddressLine3: pdfObj.businessUserDetails.country,
          PIN: pdfObj.businessUserDetails.pinCode,
          companyEmail: pdfObj.businessUserDetails.email,
          companyPhno: pdfObj.businessUserDetails.mobile,
        };

        let customer_BillingInfoJSON = {
          CustomerName: (pdfObj.customerObj.firstName + " " || " ") + (pdfObj.customerObj.lastName || " "),
          //CustomerGSTIN: '37B76C238B7E1Z5',
          CustomerState: pdfObj.customerObj.address || " ",
          //CustomerPAN: 'B76C238B7E',
          CustomerAddressLine1: pdfObj.customerObj.address || " ",
          //CustomerAddressLine2: 'ABCDEFGD P.O., NEDUMBASSERY',
          //CustomerAddressLine3: pdfObj.customerObj.address || " ",
          //PIN: pdfObj.customerObj.address || " ",
          CustomerEmail: pdfObj.customerObj.email || "",
          CustomerPhno: pdfObj.customerObj.mobile,
        };

        let invoiceJSON = {
          InvoiceNo: pdfObj.invoiceObj.invoiceNumber,
          InvoiceDate: pdfObj.invoiceObj.invoiceDate,
          SubTotalAmnt: pdfObj.invoiceObj.subTotal.toString(),
          DiscountPercentage: pdfObj.invoiceObj.discountPercentage + "%",
          DiscountAmount: pdfObj.invoiceObj.discountAmount,
          TotalGSTPERCENTAGE: pdfObj.invoiceObj.gstPercentage + "%",
          TotalGST: pdfObj.invoiceObj.gstAmount.toString(),
          GrandTotalAmnt: pdfObj.invoiceObj.invoiceTotal.toString(),
          TotalAmnt: pdfObj.invoiceObj.paidAmount.toString(),
          AdvanceAmount: pdfObj.invoiceObj.advanceAmount,
          CreditAmount: pdfObj.invoiceObj.creditAmount != null ? pdfObj.invoiceObj.creditAmount : 0,
          paidByPayables: pdfObj.invoiceObj.paidByPayables,
          paidByRewards: pdfObj.invoiceObj.paidByRewards,
          paidByReceivables: pdfObj.invoiceObj.paidByReceivables,
          totalReceivables: pdfObj.invoiceObj.totalReceivables
        };

        console.log(comapnyJSON);
        console.log(customer_BillingInfoJSON);
        console.log(invoiceJSON);

        let getBase64Image = function (img) {
          let canvas = document.createElement("canvas");
          canvas.setAttribute('crossOrigin', 'anonymous');
          canvas.width = 156;
          canvas.height = 50;
          let ctx = canvas.getContext("2d");
          let scaleToFill = (img, ctx): any => {
            // get the scale
            var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            // get the top left position of the image
            var x = (canvas.width / 2) - (img.width / 2) * scale;
            var y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            //ctx.drawImage(img, imgx, imgy, canvas.width, canvas.height);
            let dataURL = canvas.toDataURL("image/png");
            console.log(dataURL);
            return dataURL;
          };
          return scaleToFill(img, ctx);
          //ctx.drawImage(img, 0
        };

        console.log(pdfObj.logoImg);
        console.log(pdfObj.logoImg.querySelector("header .row").getElementsByTagName('img')[0]);
        let actualLogo = getBase64Image(pdfObj.logoImg.querySelector("header .row").getElementsByTagName('img')[0]);

        let company_logo = {
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALcAAABFCAYAAAAINHeNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTgwMDJGMEYyRjlDMTFFOTgyOEVGQUMwOTIyNDA3QTAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTgwMDJGMTAyRjlDMTFFOTgyOEVGQUMwOTIyNDA3QTAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxODAwMkYwRDJGOUMxMUU5ODI4RUZBQzA5MjI0MDdBMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxODAwMkYwRTJGOUMxMUU5ODI4RUZBQzA5MjI0MDdBMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pmxh53AAAApGSURBVHja7J1tbBRF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',
          w: 160,
          h: 56
        };

        if (actualLogo) {
          company_logo.src = actualLogo;
        }

        let fontSizes = {
          HeadTitleFontSize: 18,
          Head2TitleFontSize: 16,
          TitleFontSize: 14,
          SubTitleFontSize: 12,
          NormalFontSize: 10,
          SmallFontSize: 8
        };

        let lineSpacing = {
          NormalSpacing: 12,
        };

        let generate_cutomPDF = () => {

          const doc: any = new jsPDF('p', 'pt');

          let rightStartCol1 = 400;
          let rightStartCol2 = 480;
          let leftStartCol1 = 400;
          let leftStartCol2 = 480;

          let InitialstartX = 40;
          let startX = 40;
          let InitialstartY = 50;
          let startY = 0;

          let lineHeights = 12;

          doc.setFontSize(fontSizes.SubTitleFontSize);
          doc.setFont('times');
          doc.setFontType('bold');

          doc.addImage(company_logo.src, 'PNG', startX, startY += 50, company_logo.w, company_logo.h);
          doc.setFontType('bold');
          doc.text(comapnyJSON.CompanyName.toUpperCase(), 558, startY += lineSpacing.NormalSpacing, "right");

          //doc.text(comapnyJSON.CompanyName, 90, startY, "right");
          //doc.setFontType('bold');
          //doc.text("Proprietor:", rightStartCol1, startY += lineSpacing.NormalSpacing , "right");
          //doc.setFontType('normal');
          // let w = doc.getStringUnitWidth('GSTIN') * NormalFontSize;
          //doc.text(comapnyJSON.Proprietor, 560, startY+1 , "right");

          doc.setFontType('bold');
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text( (comapnyJSON.CompanyAddressLine1 ? comapnyJSON.CompanyAddressLine1+ " ,": "")  + (comapnyJSON.CompanyAddressLine3 || ""), 560, startY += lineSpacing.NormalSpacing, "right");

          //doc.setFontType('bold');
          //doc.text("Phone : ", rightStartCol1 + 40, startY += lineSpacing.NormalSpacing, "right");
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text("Phone : " + comapnyJSON.companyPhno, 560, startY += lineSpacing.NormalSpacing, "right");

          //doc.setFontType('bold');
          //doc.text("EMAIL :", rightStartCol1 + 40, startY += lineSpacing.NormalSpacing, "right");
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text("EMAIL : " + comapnyJSON.companyEmail, 560, startY += lineSpacing.NormalSpacing, "right");

          /*  --- line -- */
          doc.setLineWidth(1);

          doc.line(30, startY + lineSpacing.NormalSpacing, 560, startY += lineSpacing.NormalSpacing);
          //doc.line(380, startY + lineSpacing.NormalSpacing, 560, startY + lineSpacing.NormalSpacing);

          doc.setFontType('bold');
          doc.text("INVOICE TO : ", startX, startY += lineSpacing.NormalSpacing, "left");
          doc.setFontType('normal');

          doc.setFontType('bold');
          doc.text("INVOICE NO : ", rightStartCol1 + 80, startY, "right");
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text(invoiceJSON.InvoiceNo, 560, startY, "right");

          let tempY = InitialstartY;

          doc.setFontType('bold');
          //doc.text("Reference No: ", rightStartCol1, tempY += lineSpacing.NormalSpacing, "left");
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text(customer_BillingInfoJSON.CustomerName.toUpperCase(), startX, startY += lineSpacing.NormalSpacing, "left");

          doc.setFontType('bold');
          doc.text("Date of Invoice : ", rightStartCol1 + 80, startY, "right");
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text(invoiceJSON.InvoiceDate, 560, startY, "right");
          if (customer_BillingInfoJSON.CustomerAddressLine1 != " ") {
            doc.setFontType('bold');
            // doc.text("Reference No: ", rightStartCol1, tempY += lineSpacing.NormalSpacing, "left");
            doc.setFontType('normal');
            doc.text(customer_BillingInfoJSON.CustomerAddressLine1, startX, startY += lineSpacing.NormalSpacing, "left");
          }
          doc.setFontType('bold');
          doc.text("Ph No : ", startX, startY += lineSpacing.NormalSpacing, "left");
          doc.setFontType('normal');
          doc.setFontSize(9);
          doc.text(customer_BillingInfoJSON.CustomerPhno
            + (customer_BillingInfoJSON.CustomerEmail ? " E-Mail: " + customer_BillingInfoJSON.CustomerEmail : ''),
            startX + 30, startY, "left");

          //-------Customer Info Billing---------------------
          let startBilling = startY;

          //-------Customer Info Shipping---------------------
          let rightcol_one = 340;
          let rightcol_two = 450;

          let header = function (data) {
            doc.setFontSize(9);
            doc.setTextColor(40);
            doc.setFontStyle('normal');
          };
          // doc.autoTable(res.columns, res.data, {margin: {top:  startY+=30}});
          doc.setFontSize(9);
          doc.setFontStyle('normal');

          let options = {
            beforePageContent: header,
            margin: {
              top: 10
            },
            styles: {
              overflow: 'linebreak',
              fontSize: 8,
              rowHeight: 'auto',
              halign: 'right', // left, center, right
              valign: 'middle',
              //columnWidth: 'wrap'
            },
            startY: startY += 20
          };

          let columns = [
            { title: "Product Code", dataKey: "productCode" }, // , width: 50
            { title: "Product Name", dataKey: "productName" }, // , width: 190 
            { title: "Product Quantity", dataKey: "productQty" }, // , width: 50
            { title: "Product Price", dataKey: "productPrice" }, //, width: 100
            { title: "Product Total", dataKey: "productTotal" } //, width: 100
          ];

          let rows = pdfObj.invoiceObj.products;

          doc.autoTable(columns, rows, options);   //From dynamic data.
          // doc.autoTable(res.columns, res.data, options); //From htmlTable

          //-------Invoice Footer---------------------
          rightcol_one = 340;
          rightcol_two = 540;

          startY = doc.autoTableEndPosY() + 30;
          doc.setFontSize(fontSizes.NormalFontSize);

          doc.setFontType('bold');
          doc.text("Sub Total", rightcol_one, startY += lineSpacing.NormalSpacing + 5, "left");
          doc.setFontType('normal');
          doc.text(invoiceJSON.SubTotalAmnt, rightcol_two, startY, "right");
          doc.setFontSize(fontSizes.NormalFontSize);
          doc.setFontType('bold');
          doc.text("Discount Amount", rightcol_one, startY += lineSpacing.NormalSpacing + 5, "left");
          doc.setFontType('normal');

          doc.text(invoiceJSON.DiscountPercentage, rightcol_one + 90, startY, "left");
          doc.text(invoiceJSON.DiscountAmount.toString(), rightcol_two, startY, "right");

          doc.setFontType('bold');
          doc.text("GST", rightcol_one, startY += lineSpacing.NormalSpacing + 5, "left");
          doc.setFontType('normal');
          doc.text(invoiceJSON.TotalGSTPERCENTAGE, rightcol_one + 90, startY, "left");
          doc.text(invoiceJSON.TotalGST, rightcol_two, startY, "right");

          if (invoiceJSON.paidByReceivables > 0) {
            doc.setFontType('bold');
            doc.setFontSize(8);
            doc.setFontType('normal');
            //doc.text("2300 Receivables are received out of 2500.", startX, startY, "left");
            doc.text((invoiceJSON.paidByReceivables).toString() + " Receivables are received out of "+
              + (invoiceJSON.totalReceivables).toString(), startX, startY, "left");
          }

          doc.setFontType('bold');
          doc.text("Grand Total ", rightcol_one, startY += lineSpacing.NormalSpacing + 5, "left");
          doc.setFontType('normal');
          doc.text(invoiceJSON.TotalAmnt.toString(), rightcol_two, startY, "right");

          if (invoiceJSON.paidByPayables > 0) {
            doc.setFontType('bold');
            doc.setFontSize(8);
            doc.setFontType('normal');
            //doc.text("Rs. 1750 Payables are paid..", startX, startY, "left");
            doc.text("Rs. " + (invoiceJSON.paidByPayables).toString() + " payables are paid.", startX, startY, "left");
          }

          doc.setFontType('bold');
          doc.text("Paid Amount ", rightcol_one, startY += lineSpacing.NormalSpacing + 5, "left");
          doc.setFontType('normal');
          // let w = doc.getStringUnitWidth('GSTIN') * NormalFontSize;
          doc.text(invoiceJSON.TotalAmnt.toString(), rightcol_two, startY, "right");

          if (invoiceJSON.paidByRewards > 0) {
            doc.setFontType('bold');
            doc.setFontSize(8);
            doc.setFontType('normal');
            //doc.text("1202 Reward Points are used.", startX, startY, "left");
            doc.text((invoiceJSON.paidByRewards).toString() + " Reward Points are used.", startX, startY, "left");
          }

          if (invoiceJSON.AdvanceAmount > 0) {
            doc.setFontType('bold');
            doc.setFontSize(8);
            doc.setFontType('normal');
            doc.text("Advance  "+(invoiceJSON.AdvanceAmount).toString(), rightcol_one - 130, startY, "left");            
          }
          
          if (invoiceJSON.CreditAmount > 0) {
            doc.setFontType('bold');
            doc.setFontSize(8);
            doc.setFontType('normal');
            doc.text("Credit "+ (invoiceJSON.CreditAmount).toString(), rightcol_one - 130, startY, "left");            
          }

          doc.setFontType('bold');
          doc.text('For ' + comapnyJSON.CompanyName + ',',540, startY += lineSpacing.NormalSpacing + 50, "right");
          doc.text('Authorised Signatory', 540, startY += lineSpacing.NormalSpacing + 50, "right");
          if (pdfObj.type == 'pdf') {
            doc.save(invoiceJSON.InvoiceNo+".pdf");
          } else if (pdfObj.type == 'print') {
            window.open(URL.createObjectURL(doc.output("blob"))).print();
          }
        };
        generate_cutomPDF();
      });
  }
}