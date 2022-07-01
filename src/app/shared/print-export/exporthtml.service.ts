import { Injectable } from '@angular/core';
import * as html2canvas from 'html2canvas';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as jquery from 'jquery';
import * as Canvas2Image from 'canvas2image';
import { Base64 } from 'js-base64';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { autoTable as AutoTable } from 'jspdf-autotable';
import { environment } from '../../environments/environment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExportHtmlService {
	private window: Window;
	onePageCanvas: any;
	uploadFilePath = environment.uploadUrl;

	constructor() { }

	private convertToReqFieldsArray( listArr: any[], cols: string[]){
		let finalArr = [], reqObj = {};
		listArr.filter( (obj, indx) => {
			cols.forEach( (val) => {
				reqObj[val] = obj[val];
			});
			finalArr.push(reqObj);
			reqObj = {};
		});
		console.log(finalArr);
		return finalArr;
	}

	public exportAsExcelFile(json: any[], cols: any[], excelFileName: string): void {

		//const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, { header: cols });
		let formattedJson =[];  
		formattedJson = this.convertToReqFieldsArray( json, cols.map( obj => obj.dataKey)); //Object.values(cols);
		let columnNamesList = cols.map( obj => obj.title);
		console.log(columnNamesList);
		const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedJson);
		//, {  header: columnNamesList, skipHeader: true  }
		
		const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
		//XLSX.utils.sheet_add_json(worksheet, formattedJson, {skipHeader: true, origin: "A2"});
		 				
		//worksheet.addRow(columnNamesList);
		const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		this.saveAsExcelFile(excelBuffer, excelFileName);
	}

	private saveAsExcelFile(buffer: any, fileName: string): void {
		const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
		FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
	}

	savePDFTest(target) {
		let pdf = new jsPDF('p', 'pt', 'a4');
		let options = {
			pagesplit: true
		};

		pdf.addHTML(target, 0, 0, options, function () {
			pdf.save("test.pdf");
		});
	}

	saveAsPDF2(target) {
		html2canvas(target)
			.then((canvas) => {
				console.log(canvas);
				let data = canvas.toDataURL();
				let a4 = [595.28, 660];
				let width = canvas.clientWidth, height = canvas.clientHeight;
				let docDefinition = {
					pageSize: 'A4',
					pageMargins: [40, 25, 25, 35],
					content: [{
						image: data,
						width: 500,
						pageBreak: 'after'
					}],
					pageBreakBefore: function (currentNode, followingNodesOnPage,
						nodesOnNextPage, previousNodesOnPage) {
						return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
					}
				};
				pdfMake.createPdf(docDefinition).download("test.pdf");
			})
			.catch(err => {
				console.log("error canvas", err);
			});
	}

	saveAsPDF(divID, currntrackname) {
		let count;
		let image2Data;
		//let div_id = divID;
		let paramtwo;
		//let param = "#" + div_id;
		let param = divID;
		function titleCase(str) {
			let splitStr = str.toLowerCase().split(' ');
			for (let i = 0; i < splitStr.length; i++) {
				splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
			}
			// Directly return the joined string
			return splitStr.join(' ');
		}
		function appLogRibbon(doc, pgLen) {
			// Filled coloured square
			doc.setDrawColor(0);
			doc.setFillColor(0, 210, 255);
			doc.rect(12, 8, 190, 10, 'F');

			doc.setTextColor(0, 0, 0);
			doc.setFontSize(15);
			doc.setFont("helvetica", "normal");
			//  doc.setFontStyle("bolditalic");
			doc.text(15, 15, 'i');

			doc.setTextColor(255, 255, 255);
			doc.setFontSize(15);
			doc.setFont("helvetica", "normal");
			doc.text(17, 15, 'Reveal');

			//doc.setFontSize(5);
			// doc.text(35, 13, 'TM');
			doc.setFontSize(10);
			// doc.setFontStyle("bolditalic");
			doc.setFont("helvetica", "normal");
			doc.text(34, 15, '- SMydata Inventory & Billing Tool for Small Businesses');
			if (pgLen == 0) {
				doc.rect(0, 35, 190, 50, "F");
				doc.setTextColor(0, 0, 0);
				doc.setFontSize(10.5);
				doc.setFontStyle("bolditalic");
				doc.setFont("helvetica", "normal");
				doc.text(80, 25, titleCase(currntrackname));
			}
		}
		html2canvas(paramtwo, {
			// background : '#ffffff',
			useCORS: true
		}).then((canvas) => {
			let self = this;
			let image = new Image();
			image = canvas.toDataURL("image/png");
			console.log(image);
			let genPDF = function () {
				image = canvas.toDataURL("image/png");
				//this.AddImagesResource(image);
				//console.log(image);
				let doc = new jsPDF();

				//let croppingYPosition = 1095;
				let croppingYPosition = 0;
				//count = (image.height) / 1095;
				let imageHeight = image.height;
				count = Math.floor(imageHeight / 994);

				for (let i = 0; i <= count; i++) {
					let sourceX = 0;
					let sourceY = croppingYPosition;
					let sourceWidth = 1000;
					let sourceHeight = 1000;
					let destWidth: any = sourceWidth;
					let destHeight: any = sourceHeight;
					let destX = 0;
					let destY = 0;
					let canvas1 = document.createElement('canvas');

					canvas1.setAttribute('height', destHeight);
					canvas1.setAttribute('width', destWidth);
					let ctx = canvas1.getContext("2d");

					ctx["imageSmoothingEnabled"] = false;
					ctx["mozImageSmoothingEnabled"] = false
					ctx["oImageSmoothingEnabled"] = false
					ctx["webkitImageSmoothingEnabled"] = false
					ctx["msImageSmoothingEnabled"] = false

					//ctx.fillStyle = "blue";
					ctx.clearRect(0, 0, canvas1.width, canvas1.height);
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(0, 0, canvas1.width, canvas1.height);
					ctx.drawImage(image, sourceX, //Optional. The x coordinate where to start clipping 	
						sourceY, //Optional. The y coordinate where to start clipping 	
						sourceWidth, //Optional. The width of the clipped image 
						sourceHeight, //Optional. The height of the clipped image 
						destX, //The x coordinate where to place the image on the canvas 
						destY, //The y coordinate where to place the image on the canvas 
						destWidth, //Optional. The width of the image to use (stretch or reduce the image)
						destHeight);//Optional. The height of the image to use (stretch or reduce the image)
					let image2: any = new Image();
					image2 = canvas1.toDataURL("image/png");
					image2Data = image2.src;
					/* without SMydata ribbon*/
					//doc.addImage(image2Data, 'JPEG', 12, 10,190,275); // uncomment to remove SMydata ribbon in the PDF pages
					/* with SMydata ribbon*/
					appLogRibbon(doc, i); //comment to remove SMydata ribbon in the PDF pages
					doc.addImage(image2Data, 'PNG', -20, 28, 0, 0); //comment to remove SMydata ribbon in the PDF pages

					croppingYPosition += destHeight;
					if (i != count) {
						doc.addPage();
					}
				}

				//let filename = div_id;
				//doc.save(filename + '_rackview.pdf');					
				doc.save(currntrackname + '.pdf');
			}//genPDF()

			if (image.height == 0 || image.width == 0) {
				setTimeout(genPDF, 100);
			}
			else {
				genPDF();
			}
		})//html2canvas
			.catch(function (err) { console.log(err); });

	}//saveAsPDF()

	makePDF(divelm) {

		let quotes = divelm;
		//document.getElementById('container-fluid');

		html2canvas(quotes, {
			useCORS: true
		}).then((canvas) => {

			//! MAKE YOUR PDF
			let pdf = new jsPDF('p', 'mm', 'a4');

			for (let i = 0; i <= quotes.clientHeight / 980; i++) {
				//! This is all just html2canvas stuff
				let srcImg = canvas;
				let sX = 0;
				let sY = 980 * i; // start 980 pixels down for every new page
				let sWidth = 900;
				let sHeight = 980;
				let dX = 0;
				let dY = 0;
				let dWidth = 900;
				let dHeight = 980;
				let ratio = quotes.clientHeight / quotes.clientWidth;

				this.onePageCanvas = document.createElement("canvas");
				this.onePageCanvas.setAttribute('width', pdf.internal.pageSize.getWidth());
				this.onePageCanvas.setAttribute('height', pdf.internal.pageSize.getHeight());
				let ctx = this.onePageCanvas.getContext('2d');
				// details on this usage of this function: 
				ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

				// document.body.appendChild(canvas);
				let canvasDataURL = this.onePageCanvas.toDataURL("image/png", 1.0);

				let width = pdf.internal.pageSize.getWidth();
				let height = pdf.internal.pageSize.getHeight();
				height = ratio * width;
				//this.window.document.body.appendChild(this.onePageCanvas);
				//! If we're on anything other than the first page,
				// add another page
				if (i > 0) {
					pdf.addPage('a4', 'p'); //8.5" x 11" in pts (in*72)
				}
				//! now we declare that we're working on that page
				pdf.setPage(i + 1);
				//! now we add content to that page!
				pdf.addImage(canvasDataURL, 'PNG', 10, 20, (width * .62), (height * .62));

			}
			console.log(pdf);
			debugger;
			//! after the for loop is finished running, we save the pdf.
			pdf.save('test.pdf');
		});
	}

	exportPdf(param) {
		let pdf = new jsPDF('l', 'mm', 'a4');
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const pageRatio = pageWidth / pageHeight;

		let generatePdf = function (urls) {
			for (let i = 0; i < urls.length / 1000; i++) {
				let img = new Image();
				//img.src = (urls/1000);
				img.onload = function () {
					img;
					const imgWidth = img.width;
					const imgHeight = img.height;
					const imgRatio = imgWidth / imgHeight;
					if (i > 0) { pdf.addPage(); }
					pdf.setPage(i + 1);
					if (imgRatio >= 1) {
						const wc = imgWidth / pageWidth;
						if (imgRatio >= pageRatio) {
							pdf.addImage(img, 'JPEG', 0, (pageHeight - imgHeight / wc) / 2, pageWidth, imgHeight / wc, null, 'NONE');
						}
						else {
							const pi = pageRatio / imgRatio;
							pdf.addImage(img, 'JPEG', (pageWidth - pageWidth / pi) / 2, 0, pageWidth / pi, (imgHeight / pi) / wc, null, 'NONE');
						}
					}
					else {
						const wc = imgWidth / pageHeight;
						if (1 / imgRatio > pageRatio) {
							const ip = (1 / imgRatio) / pageRatio;
							const margin = (pageHeight - ((imgHeight / ip) / wc)) / 4;
							pdf.addImage(img, 'JPEG', (pageWidth - (imgHeight / ip) / wc) / 2, -(((imgHeight / ip) / wc) + margin), pageHeight / ip, (imgHeight / ip) / wc, null, 'NONE', -90);
						}
						else {

							pdf.addImage(img, 'JPEG', (pageWidth - imgHeight / wc) / 2, -(imgHeight / wc), pageHeight, imgHeight / wc, null, 'NONE', -90);
						}
					}
					//if (i == urls.length - 1) {
					pdf.save('Photo.pdf');
					//}
				}
			}
		}

		html2canvas(param, {
			// background : '#ffffff',
			useCORS: true
		}).then((canvas) => {
			let self = this;
			let image = new Image();
			image = canvas.toDataURL("image/png");
			console.log(image);
			generatePdf(image);
		});
	}

	pdftest(param) {

		const PAGE_HEIGHT = 500;
		const PAGE_WIDTH = 500;

		//const PAGE_HEIGHT = param.clientHeight;                                                                                                                                                            
		//const PAGE_WIDTH = param.clientWidth; 

		const content = [];

		function getPngDimensions(base64) {
			let header: any = atob(base64.slice(22, 70)).slice(16, 24);
			//const header = new Uint8Array(base64.result as ArrayBuffer).subarray(0, 4);
			const uint8 = Uint8Array.from(header, c => String(c).charCodeAt(0));
			//String.fromCharCode.apply(null, header);							
			const dataView = new DataView(uint8.buffer);
			//const dataView = new DataView(header.buffer);

			return {
				width: dataView.getInt32(0),
				height: dataView.getInt32(4)
			};
		}

		const splitImage = (img, content, callback) => () => {

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const printHeight = img.height * PAGE_WIDTH / img.width;

			canvas.width = PAGE_WIDTH;

			for (let pages = 0; printHeight > pages * PAGE_HEIGHT; pages++) {
				/* Don't use full height for the last image */
				canvas.height = Math.min(PAGE_HEIGHT, printHeight - pages * PAGE_HEIGHT);
				ctx.drawImage(img, 0, printHeight - pages * PAGE_HEIGHT, canvas.width, printHeight);
				content.push({ image: canvas.toDataURL(), margin: [10, 5], width: PAGE_WIDTH });
			}

			callback();
		};

		function next() {
			/* add other content here, can call addImage() again for example */
			pdfMake.createPdf({ content }).download();
		}

		let addImage = function (imgdata: any) {
			/* Load big image */
			const image = imgdata;

			const { width, height } = getPngDimensions(image);
			const printHeight = height * PAGE_WIDTH / width;

			if (printHeight > PAGE_HEIGHT) {
				const img = new Image();
				img.onload = splitImage(img, content, next);
				img.src = image;
				return;
			}

			content.push({ image, margin: [10, 5], width: PAGE_WIDTH });
			next();
		}

		html2canvas(param, {
			// background : '#ffffff',
			useCORS: true
		}).then((canvas) => {
			let self = this;
			let image = new Image();
			image = canvas.toDataURL("image/png", 1.0);
			//console.log(image);
			addImage(image);
		});
	}
	printpdf(param) {
		let printdiv = function (imgdata) {
			/*let mywindow = window.open('', 'PRINT', 'height=400,width=600');

			mywindow.document.write('<html><head><title> print image </title>');
			mywindow.document.write('</head><body >');
			mywindow.document.write('<h1> print image  </h1>');
			mywindow.document.write('<img src="'+param.toDataURL()+'" />');
			mywindow.document.write('</body></html>');
			//mywindow.document.body.appendChild(imgdata);
			mywindow.document.close(); // necessary for IE >= 10
			mywindow.focus(); // necessary for IE >= 10

			mywindow.print();
			mywindow.close();
			let popupWin = window.open();
			popupWin.document.open();
			popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="../home/invoice-type-one/invoice-one.component.css" /></head><body onload="window.print()">' + param.innerHTML + '</html>');
			popupWin.document.close();*/


			let blob = new Blob([param.innerHTML], { type: 'application/pdf' });
			let fileUrl = window.URL.createObjectURL(blob);
			if (window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveOrOpenBlob(blob, fileUrl.split(':')[1] + '.pdf');
			} else {
				window.open(fileUrl);
			}
			return true;
		};

		html2canvas(param, {
			// background : '#ffffff',
			useCORS: true
		}).then((canvas) => {
			let self = this;
			let image = new Image();
			image = canvas.toDataURL("image/png");
			//alert(c.toDataURL());

			//let img: any = document.createElement('img');
			//img.setAttribute("src", image);
			//	let newWindow = window.open();
			//	newWindow.document.write(param.appendChild(img));
			//newWindow.print();	
			//window.open(canvas.toDataURL('imgage/png') , "_blank");

			canvas.toBlob(function (blob) {
				// Generate file download
				//this.window.saveAs(blob, "yourwebsite_screenshot.png");
				let newWindow: any = window.open('/');

				newWindow.onload = () => {
					newWindow.location = URL.createObjectURL(blob);
					console.log(URL.createObjectURL(blob));
					setTimeout(() => {
						let styleatt = document.createElement('style');
						styleatt.innerHTML = '@page{size:landscape;}';
						newWindow.document.head.append(styleatt);
						newWindow.print();
					}, 500);
				};
			});
			//	let imageData= canvas.toDataURL("image/png", 1.0)
			//let newData = imageData.replace(/^data:image\/png/, "data:application/octet-stream");
			//printdiv(newData);			 
		});
	}

	generatePDF(content) {

		html2canvas(content)
			.then((canvas) => {
				console.log(content);
				console.log(canvas);
				let pages = Math.ceil(content.clientHeight / 1000);
				let pdf = new jsPDF('p', 'mm', 'a4');
				for (let i = 0; i <= pages; i += 1) {
					if (i > 0) {
						pdf.addPage();
					}
					let srcImg = canvas,
						sX = 0,
						sY = 1000 * i,
						sWidth = 1000,
						sHeight = 1000,
						dX = 0,
						dY = 0,
						dWidth = 1100,
						dHeight = 1000;
					let onePageCanvas = document.createElement("canvas");
					document.body.appendChild(onePageCanvas);
					onePageCanvas.setAttribute('width', '1000');
					onePageCanvas.setAttribute('height', '1000');
					let ctx = onePageCanvas.getContext('2d');
					ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
					let canvasDataURL = onePageCanvas.toDataURL("image/png"),
						width = onePageCanvas.width,
						height = onePageCanvas.clientHeight;
					pdf.setPage(i + 1);
					pdf.addImage(canvasDataURL, 'PNG', 35, 30, (width * 0.5), (height * 0.5));
					//pdf.addImage(canvasDataURL, 'PNG', 35, 30, (width * 0.75), height);
				}
				setTimeout(() => {
					pdf.save('multifilepdf.pdf');
				}, 500);
			});
	}

	saveImageToPdf(idOfHtmlElement) {

		html2canvas(idOfHtmlElement)
			.then((canvas) => {
				let width = canvas.width;
				let height = canvas.height;
				let millimeters = {};
				millimeters['width'] = Math.floor(width * 0.264583);
				millimeters['height'] = Math.floor(height * 0.264583);

				let imgData = canvas.toDataURL('image/png', 1.0);
				let doc = new jsPDF("l", "mm", "a4");
				doc.deletePage(1);
				doc.addPage(millimeters['width'], millimeters['height']);
				doc.addImage(imgData, 'JPEG', 0, 0);
				doc.save('WebSiteScreen.pdf');
			});
	}

	getPDFData(divcontent) {
		html2canvas(divcontent)
			.then((canvas) => {

				let pdf = new jsPDF("l", "mm", "a4");   //orientation: landscape
				let imgData = canvas.toDataURL('image/png', 1.0);
				let width = pdf.internal.pageSize.getWidth();
				let height = pdf.internal.pageSize.getHeight();
				pdf.addImage(imgData, 'JPEG', 10, 10, width - 10, height - 20);
				return pdf;
			});
	}

	generatePDFFileTest(divcontent, outputType) {
		html2canvas(divcontent, { scale: 2 })
			.then((canvas) => {
				var context = canvas.getContext("2d");
				context.scale(2, 2);
				context["imageSmoothingEnabled"] = false;
				context["mozImageSmoothingEnabled"] = false;
				context["oImageSmoothingEnabled"] = false;
				context["webkitImageSmoothingEnabled"] = false;
				context["msImageSmoothingEnabled"] = false;
				let imgData = canvas.toDataURL('image/png', 1.0);
				var doc = new jsPDF('p', 'mm', 'a4');
				doc.addImage(imgData, 'PNG', 10, 10, 297, 210);
				if (outputType == 'pdf') {
					doc.save('sample2.pdf');
				} else if (outputType == 'print') {
					window.open(URL.createObjectURL(doc.output("blob")));
				} else {

				}
			});
	}

	generatePdfFile(divcontent, outputType, page?: any, pageId?: any) {

		html2canvas(divcontent, { scale: 2 })
			.then((canvas) => {
				let imgData = canvas.toDataURL('image/png', 1.0);
				//imgData.scale(2,2);
				let pdf = new jsPDF('l', 'mm', 'a4');   //orientation: landscape  jsPDF("p", "mm", "a4");
				let width = pdf.internal.pageSize.getWidth();
				let height = pdf.internal.pageSize.getHeight();
				console.log(width, height);
				if (page && page == 'dashboard') {
					pdf.addImage(imgData, 'png', 0, 0, width, height);
				} else {
					pdf.addImage(imgData, 'png', 0, 0, width, height);
				}
				if (outputType == 'pdf') {
					pageId = (pageId != undefined ? pageId : 'details');
					pdf.save('dashboard-' + pageId + '.pdf');
				} else if (outputType == 'print') {
					window.open(URL.createObjectURL(pdf.output("blob"))).print();
				} else {

				}
			});
	}

	generatePrintFile(divcontent) {
		//let pdf: any = this.getPDFData(divcontent);
		html2canvas(divcontent)
			.then((canvas) => {

				let pdf = new jsPDF("p", "mm", "a4");   //orientation: landscape
				let imgData = canvas.toDataURL('image/png', 1.0);
				let width = pdf.internal.pageSize.getWidth();
				let height = pdf.internal.pageSize.getHeight();
				pdf.addImage(imgData, 'JPEG', 10, 10, width - 10, height - 20);
				//window.open("data:application/pdf;base64," + Base64.encode(imgData))
				//window.document.write("<iframe width='100%' height='100%' src='encodeURI(imgData)'></iframe>", "_blank")
				//window.open("data:application/pdf," + encodeURI(imgData)); 

				let blob = new Blob([imgData.data], { type: 'application/pdf' });

				let fileUrl = window.URL.createObjectURL(blob);
				if (window.navigator.msSaveOrOpenBlob) {
					window.navigator.msSaveOrOpenBlob(blob, fileUrl.split(':')[1] + '.pdf');
				} else {
					window.open(fileUrl);
				}
				return true;

			});
	}

	generatetwo(divcontent) {

		html2canvas(divcontent, {
			// background : '#ffffff',
			useCORS: true
		}).then((canvas) => {
			let self = this;
			let image = new Image();
			image = canvas.toDataURL("image/png");
			//alert(c.toDataURL());

			canvas.toBlob(function (blob) {
				let newWindow: any = window.open('/', "_blank");

				//newWindow.onload = () => {
				newWindow.location = URL.createObjectURL(blob);
				console.log(URL.createObjectURL(blob));
				setTimeout(() => {
					let styleatt = document.createElement('style');
					styleatt.innerHTML = '@page{size:landscape;} @media print { @page { margin: 0; } body { margin: 1.2cm; } }';
					newWindow.document.head.append(styleatt);
					newWindow.print();
				}, 50);
				//};
			});
		});
	}

	generateEmailFile(divcontent) {
		let pdf: any = this.getPDFData(divcontent);
		html2canvas(divcontent)
			.then((canvas) => {

				let pdf = new jsPDF("l", "mm", "a4");   //orientation: landscape
				let imgData = canvas.toDataURL('image/png', 1.0);
				let width = pdf.internal.pageSize.getWidth();
				let height = pdf.internal.pageSize.getHeight();
				pdf.addImage(imgData, 'JPEG', 10, 10, width - 10, height - 20);
				console.log(encodeURI(imgData));
				/*let file = pdf.output('blob');
				let formData = new FormData();     // To carry on your data  
				fd.append('mypdf', file);
				formData.append('email', 'saratatasterittech@gmail.com');
				this.http.post(restUrl + '/api/upload?businessId=' + this.presentProfile.businessId, this.formData)
				.subscribe((data: any) => {
					alert('sented successfully');
				}, error => {
					alert("It is not created. Some error happened.");
				});
				*/
				return encodeURI(imgData);
			});
	}

	multipagePDF(divTag, divcontent) {
		html2canvas(divcontent).then(canvas => {
			try {
				//let contentH = divTag.height();
				let $w, $actw, $h, $acth, $maxw, $maxh, $count, position;
				let img = canvas.toDataURL("image/png", 1.0);
				$w = $actw = canvas.width;
				$h = $acth = canvas.height;
				let pdf = new jsPDF("p", "mm", "a4");
				let width = $maxw = pdf.internal.pageSize.width;
				let height = $maxh = pdf.internal.pageSize.height;
				if (!$maxw) $maxw = width;
				if (!$maxh) $maxh = height;
				if ($w > $maxw) {
					$w = $maxw;
					$h = Math.round($acth / $actw * $maxw);
				}
				pdf.addImage(img, 'JPEG', 0, 0, $w, $h);
				$count = Math.ceil($h) / Math.ceil($maxh);
				$count = Math.ceil($count);
				for (let i = 1; i <= $count; i++) {
					position = - $maxh * i
					//alert(position);
					//pdf.addPage(img, 'JPEG', 0, 0, $w, $h);
					pdf.addPage('a4', 'p');
					pdf.addImage(img, 'JPEG', 0, position, $w, $h);
				}
				pdf.save("cart.pdf");
			} catch (e) {
				alert("Error description: " + e.message);
			}
		});
	}

	pdfMakePdfGenerate(divcontent) {
		html2canvas(divcontent)
			.then((canvas) => {
				let data = canvas.toDataURL('image/jpeg', 1.0);
				let docDefinition = {

					content: [{
						image: data,
						width: 580,
						height: 'auto'
					}],
					pageSize: 'A4',
					pageMargins: [20, 10, 10, 20],
				};
				pdfMake.createPdf(docDefinition).download("invoice.pdf");
			});
	}

	makePDFDownload(divcontent) {


		html2canvas(divcontent)
			.then((canvas) => {
				//! MAKE YOUR PDF
				let pdf = new jsPDF('l', 'mm', 'a4');

				for (let i = 0; i <= divcontent.clientHeight / 980; i++) {
					//! This is all just html2canvas stuff
					let srcImg = canvas;
					let sX = 0;
					let sY = 980 * i; // start 980 pixels down for every new page
					let sWidth = 900;
					let sHeight = 980;
					let dX = 0;
					let dY = 0;
					let dWidth = 900;
					let dHeight = 980;

					let onePageCanvas = document.createElement("canvas");
					onePageCanvas.setAttribute('width', '900');
					onePageCanvas.setAttribute('height', '980');
					let ctx = onePageCanvas.getContext('2d');
					// details on this usage of this function: 
					// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
					ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

					// document.body.appendChild(canvas);
					let canvasDataURL = onePageCanvas.toDataURL("image/jpeg", 1.0);

					let width = onePageCanvas.width;
					let height = onePageCanvas.clientHeight;

					//! If we're on anything other than the first page,
					// add another page
					if (i > 0) {
						pdf.addPage(); //8.5" x 11" in pts (in*72)
						//[612, 791], 'landscape'
					}
					//! now we declare that we're working on that page
					pdf.setPage(i + 1);
					//! now we add content to that page!
					pdf.addImage(canvasDataURL, 'JPEG', 10, 10, 180, 150);

				}
				//! after the for loop is finished running, we save the pdf.
				pdf.save('Test.pdf');
			});
	}

	// convert image to base64	

	public getBase64Image(imgUrl, callback) {
		var img = new Image();

		// onload fires when the image is fully loadded, and has width and height

		img.onload = function () {
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			var dataURL = canvas.toDataURL("image/png"),
				dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
			callback(dataURL); // the base64 string	
		};
		// set attributes and src 
		img.setAttribute('crossOrigin', 'anonymous'); //
		img.src = imgUrl;
	}

	pdfWholePage(pdfDiv) {
		html2canvas(pdfDiv)
			.then((canvas) => {
				let doc = new jsPDF();
				doc.addHTML(canvas, 15, 15, {
					'background': '#fff',
				}, function () {
					doc.save('fullPage.pdf');
				});
			});
	}

	printWholePage(pdfDiv) {
		/*let doc = new jsPDF();
		doc.addHTML(pdfDiv[0], 15, 15, {
			'background': '#fff',
		}, function () {
			//doc.save('fullPage.pdf');
			window.open(URL.createObjectURL(doc.output("blob")));
		}); */
		html2canvas(pdfDiv)
			.then((canvas) => {
				let imgData = canvas.toDataURL('image/png');
				let doc = new jsPDF();
				doc.addImage(imgData, 'PNG', 10, 10);
				window.open(URL.createObjectURL(doc.output("blob")));
			});
	}

	// convert table to pdf, print format
	convertToPDF(pdfObj) {
		let tblIdElement = <HTMLElement>document.getElementById(pdfObj.tblId);
		html2canvas(tblIdElement)
			.then((canvas) => {
				const doc: any = new jsPDF('p', 'pt');
				let totalPagesExp = "{total_pages_count_string}";
				let cols = [], rows = [], rowCountModNew = [];
				if (pdfObj.pdfArray.length > 0) {
					cols = pdfObj.cols;

					let clean = function (obj) {
						for (var propName in obj) {
							if (obj[propName] === null || obj[propName] === undefined) {
								delete obj[propName];
							}
						}
					};

					pdfObj.pdfArray.filter((obj, indx) => {
						let objj = {};
						cols.forEach((val, indx) => {
							objj[val.dataKey] = obj[val.dataKey];
						});
						rowCountModNew.push(Object.values(objj));
						objj = {};
					});

					rowCountModNew.forEach(element => {
						rows.push(clean(element));
					});

					/*((doc as any).autoTable as AutoTable)({
						head: [cols.map(obj => obj.title)],
						body: rowCountModNew,
						showHead: 'everyPage',
						margin: { top: 60 },
						pageBreak: 'auto', // 'auto', 'avoid' or 'always'
						tableWidth: 'auto',
						didDrawCell: data => {
							//console.log(data.column.index)
						},
						didDrawPage: function (data) {
							doc.text(pdfObj.fileName, 40, 30);
						},
					}); */

					doc.autoTable(cols, pdfObj.pdfArray, {
						styles: {
							cellPadding: 5,
							fontSize: 10,
							font: "helvetica", // helvetica, times, courier
							lineColor: 200,
							lineWidth: 0.1,
							fontStyle: 'normal', // normal, bold, italic, bolditalic
							overflow: 'linebreak', // visible, hidden, ellipsize or linebreak
							//fillColor: 255,
							//textColor: 20,
							halign: 'left', // left, center, right
							valign: 'middle', // top, middle, bottom
							fillStyle: 'F', // 'S', 'F' or 'DF' (stroke, fill or fill then stroke)
							rowHeight: 20,
							columnWidth: 'auto'
						},
						startY: false, // false (indicates margin top value) or a number
						margin: { top: 50, right: 30, bottom: 40, left: 30 },
						pageBreak: 'auto', // 'auto', 'avoid' or 'always'
						tableWidth: 'auto',
						addPageContent: function (data) {
							console.log(data);
							// HEADER
							doc.setFontSize(14);
							doc.setTextColor(40);
							doc.setFontStyle('normal');

							let getBase64Image = function (imgUrl, callback) {
								var img = new Image();

								// onload fires when the image is fully loadded, and has width and height

								img.onload = function () {
									var canvas = document.createElement("canvas");
									canvas.width = img.width;
									canvas.height = img.height;
									var ctx = canvas.getContext("2d");
									ctx.drawImage(img, 0, 0);
									var dataURL = canvas.toDataURL("image/png"),
										dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
									callback(dataURL); // the base64 string	
								};
								// set attributes and src 
								img.setAttribute('crossOrigin', 'anonymous'); //
								img.src = imgUrl;
							};


							let logo_url: any;
							//logo_url = 'https://smydata.com/images/'+pdfObj.businessLogoName;
							logo_url = 'https://localhost:5000/assets/images/smydata-logo.png';

							let getImgFromUrl = function (logo_url, callback) {
								var img = new Image();
								img.src = logo_url;
								img.onload = function () {
									callback(img);
								};
							};

							const toDataURL = url => fetch(url)
								.then(response => response.blob())
								.then(blob => new Promise((resolve, reject) => {
									const reader = new FileReader()
									reader.onloadend = () => resolve(reader.result)
									reader.onerror = reject
									reader.readAsDataURL(blob)
								}))

							//pdfObj.imgFile
							getBase64Image(pdfObj.imgFile, (dataUrl) => {
								console.log('RESULT:', dataUrl)
								if (dataUrl) {
									//doc.addImage(dataUrl, 'JPEG', data.settings.margin.left, 15, 10, 10);
								}
							});

							toDataURL(logo_url)
								.then(dataUrl => {
									console.log('RESULT:', dataUrl)
									if (dataUrl) {
										//doc.addImage(dataUrl, 'JPEG', data.settings.margin.left, 15, 10, 10);
									}
								})


							getImgFromUrl(logo_url, function (base64Img) {
								if (base64Img) {
									//doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10);
								}
							});
							/*
							imgToBase64(logo_url, function (base64) {
								let base64Img = base64;
								if (base64Img) {
									doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10);
								}
							}); */

							doc.text(pdfObj.fileName, data.settings.margin.left + 15, 22);

							// FOOTER
							let str = "Page " + data.pageCount;
							// Total page number plugin only available in jspdf v1.0+
							if (typeof doc.putTotalPages === 'function') {
								str = str + " of " + totalPagesExp;
							}
							doc.setFontSize(10);
							doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
						}
					});
					// Total page number plugin only available in jspdf v1.0+
					if (typeof doc.putTotalPages === 'function') {
						doc.putTotalPages(totalPagesExp);
					}
					if (pdfObj.type == "pdf") {
						doc.save(pdfObj.tblId + '.pdf');
					} else if (pdfObj.type == "print") {
						//window.open(doc.output('bloburl'), '_blank');
						//doc.output('dataurlnewwindow');
						window.open(URL.createObjectURL(doc.output("blob"))).print();
					} else {

					}
				} else {
					alert('No records. empty table');
				}
			});
	}
}
