import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';
import './DropzoneComponent.css'

// Компонент DropzoneComponent
function DropzoneComponent(props) {
  // Хранилище файлов
  const [files, setFiles] = useState([]);
  // Хранилище данных таблицы
  const [tableData, setTableData] = useState([]);

  // Обработчик перетаскивания или выбора файлов
  const onDrop = useCallback(acceptedFiles => {
    // Устанавливаем файлы в хранилище
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  // Обновляем данные таблицы при изменении файлов
  useEffect(() => {
    // Для каждого файла
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
      };
      // Читаем файл как бинарные данные
      reader.readAsBinaryString(file);
    });
  }, [files, props.setUploadedData]);

  // Очищаем данные об URL при размонтировании компонента
  useEffect(() => () => {
    // Для каждого файла
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

  return (
    <section>
      {/* Область перетаскивания файлов */}
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        <div>Drag and drop your CSV/XLS files here.</div>
      </div>
      {/* Отображение выбранных файлов */}
      <aside>{thumbs}</aside>
      {/* Таблица */}
      <table>
        {/* Заголовки */}
        <thead>
          <tr>
            {tableData.columns &&
              tableData.columns.map(column => <th key={column}>{column}</th>)
            }
          </tr>
        </thead>
        {/* Тело таблицы */}
        <tbody>
          {/* Отображаем первые 5 строк данных */}
          {tableData.slice(0,5).map((row, index) => (
            <tr key={index}>
              {/* Отображаем данные в ячейках таблицы */}
              {tableData.columns.map((column, columnIndex) => (
                <td key={`${index}-${columnIndex}`}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default DropzoneComponent;

/* import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  transition: 'border .3s ease-in-out'
};

function DropzoneComponent(props) {
  const [files, setFiles] = useState([]);
  const [tableData, setTableData] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  useEffect(() => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const str123 = '1,2,3,4,5,6\n'
        const csvData = str123+XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        console.log(csvData);
        const data = d3.csvParse(csvData);
        props.setUploadedData(data);
        setTableData(data);
      };
      reader.readAsBinaryString(file);
    });
  }, [files, props.setUploadedData]);

  useEffect(() => () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const thumbs = files.map(file => (
    <div key={file.name}>
      <div>{file.name}</div>
    </div>
  ));

  return (
    <section>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <div>Drag and drop your CSV/XLS files here.</div>
      </div>
      <aside>{thumbs}</aside>
      <table>
        <thead>
          <tr>
            {tableData.columns &&
              tableData.columns.map(column => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(0,5).map((row, index) => (
            <tr key={index}>
              {tableData.columns.map((column, columnIndex) => (
                <td key={`${index}-${columnIndex}`}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default DropzoneComponent; */
