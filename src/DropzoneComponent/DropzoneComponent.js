import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';
import './DropzoneComponent.css';
import {
  EmployessHeaders,
  MaterialsHeaders,
  ToolsHeaders,
  NomenclatureHeaders,
  NomenclatureGroupsHeaders,
  NormalizationOfCyclesHeaders
} from '../utils/constants'

let predefinedHeaders = [];

function DropzoneComponent(props) {
  // Хранилище файлов
  const [files, setFiles] = useState([]);
  // Хранилище данных таблицы
  const [tableData, setTableData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableType, setTableType] = useState('');

  // Обработчик перетаскивания или выбора файлов
  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);
  // Обновляем данные таблицы при изменении файлов
  useEffect(() => {
    files.forEach(file => {
      // Создаем объект FileReader
      const reader = new FileReader();
      // Когда данные файла загружены
      reader.onload = event => {
        // Читаем данные с помощью библиотеки XLSX
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const str123 = '1,2,3,4,5,6\n'
        // Преобразуем данные листа в CSV формат
        const csvData =str123+ XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        // Преобразуем CSV данные в массив объектов
        const data = d3.csvParse(csvData);
        // Устанавливаем данные в хранилище
        setTableData(data);
        // Устанавливаем данные во внешнее хранилище
        props.setUploadedData(data);
        setShowPopup(true);
      };
      reader.readAsBinaryString(file);
    });
  }, [files, props.setUploadedData]);

  // Очищаем данные об URL при размонтировании компонента
  useEffect(() => () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);
  // Получаем пропсы для области перетаскивания файлов с помощью кастомного хука useDropzone
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  // Отображаем название загруженного файла
  const thumbs = files.map(file => (
    <div key={file.name}>
      <div>{file.name}</div>
    </div>
  ));
  //обновление заголовки таблицы при изменении значения в поле ввода для заголовка
  const handleHeaderChange = (index, event) => {
    const updatedHeaders = [...tableHeaders];
    updatedHeaders[index] = event.target.value;
    setTableHeaders(updatedHeaders);
  };
  // изменение выбранного типа таблицы.
  const handleTableTypeChange = (event) => {
    const selectedType = event.target.value;
    console.log(selectedType)
    if(selectedType==='Employess'){
      predefinedHeaders=EmployessHeaders;
    }
    else if(selectedType==='Materials'){
      predefinedHeaders=MaterialsHeaders;
    }
    else if(selectedType==='Tools'){
      predefinedHeaders=ToolsHeaders;
    }
    else if(selectedType==='Nomenclature'){
      predefinedHeaders=NomenclatureHeaders;
    }
    else if(selectedType==='NomenclatureGroups'){
      predefinedHeaders=NomenclatureGroupsHeaders;
    }
    else if(selectedType==='NormalizationOfCycles'){
      predefinedHeaders=NormalizationOfCyclesHeaders;
    }
    setTableType(selectedType);
    setShowPopup(true);
    setTableHeaders([]);
  };
  // обработка данных таблицы и обновление
  const handleSubmit = () => {
    setShowPopup(false);
    const updatedTableData = tableData.map(row => {
      const newRow = {};
      tableHeaders.forEach((newHeader, index) => {
        const oldHeader = tableData.columns[index];
        newRow[newHeader] = row[oldHeader];
      });
      return newRow;
    });
    if (tableType === 'Employess') {
      exportToCSV(updatedTableData, 'http://albaplus.qcan.su/admin/?action=employees');
    } else if (tableType === 'Materials') {
      exportToCSV(updatedTableData, 'http://albaplus.qcan.su/admin/?action=material');
    } else if (tableType === 'Tools') {
      exportToCSV(updatedTableData, 'http://albaplus.qcan.su/admin/?action=instrument');
    } else if (tableType === 'Nomenclature') {
      exportToCSV(updatedTableData, 'http://albaplus.qcan.su/admin/?action=production');
    } else if (tableType === 'NomenclatureGroups') {
      exportToCSV(updatedTableData, 'http://albaplus.qcan.su/admin/?action=production_group');
    } else if (tableType === 'NormalizationOfCycles') {
      exportToCSV(updatedTableData, 'nhttp://albaplus.qcan.su/admin/?action=norma,');
    }
    //exportToXLSX(updatedTableData);
  };

  const exportToCSV = (dataToExport, api) => {

  
    const csvContent = d3.csvFormat(dataToExport);
    // Отправьте csvContent на соответствующий конечную точку API 
    fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
      },
      body: csvContent,
    })
      .then(response => {
        if (response.ok) {
          console.log('CSV сохранен на сервере.');
          // Дополнительный код при успешном сохранении
        } else {
          console.error('Ошибка при сохранении CSV на сервере.');
          // Дополнительный код при ошибке сохранения
        }
      })
      .catch(error => {
        console.error('Ошибка при сохранении CSV на сервере:', error);
        // Дополнительный код при ошибке сохранения
      });
  };

  /* const exportToXLSX = (dataToExport) => {
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    }
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'table.xlsx');
    link.click();
  }; */


  return (
    <section>
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        <div>Drag and drop your CSV/XLS files here.</div>
      </div>
      <aside>{thumbs}</aside>
      <table>
        <thead>
          <tr>
            {tableData.columns && tableData.columns.map((column, index) => (
                <th key={column}>
                  {showPopup ? (
                    <select
                      value={tableHeaders[index] || ''}
                      onChange={(event) => handleHeaderChange(index, event)}
                    >
                      <option value="">Выберите заголовок</option>
                      {predefinedHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  ) : (
                    column
                    )}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(0, 5).map((row, index) => (
            <tr key={index}>
              {tableData.columns.map((column, columnIndex) => (
                <td key={`${index}-${columnIndex}`}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {showPopup && (
        <div className="popup">
        <h2>Select Table Headers</h2>
        <select value={tableType} onChange={handleTableTypeChange}>
          <option value="">Select Table Type</option>
          <option value="Employess">Сотрудники</option>
          <option value="Materials">Материалы</option>
          <option value="Tools">Инструменты</option>
          <option value="Nomenclature">Номенклатура</option>
          <option value="NomenclatureGroups">Группы номенклатур</option>
          <option value="NormalizationOfCycles">Нормирование циклов</option>
        </select>
        {tableHeaders.map((header, index) => (
          <div key={index}>
            <label htmlFor={`header-${index}`}>Header {index + 1}</label>
            
          </div>
          ))}
          <button onClick={handleSubmit}>Save</button>
        </div>
      )}
    </section>
  );
}
export default DropzoneComponent;