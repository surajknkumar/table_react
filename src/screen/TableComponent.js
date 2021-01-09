/**
 * @format
 * @author Suraj Kumar
 * @email surajknkumar@gmail.com
 * @Owner Interview
 */
import React, {useEffect, useState} from 'react';

import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  usePagination,
} from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

// Define a default UI for filtering
const GlobalFilter = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) => {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{' '}
      <input
        className="form-control"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
    </span>
  );
};

const DefaultColumnFilter = ({
  column: {filterValue, preFilteredRows, setFilter},
}) => {
  const count = preFilteredRows.length;

  return (
    <input
      className="form-control"
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Search ${count} records...`}
    />
  );
};

const Table = ({columns, data}) => {
  const defaultColumn = React.useMemo(
    () => ({
      // Default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    preGlobalFilteredRows,
    state: {pageIndex, pageSize},
    setGlobalFilter,
    gotoPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {pageIndex: 1, pageSize: 5},
    },
    useFilters,
    useGlobalFilter,
    usePagination
  );

  return (
    <div>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <table className="table" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                  {/* Render the columns filter UI */}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <ul className="pagination">
        <li
          className="page-item"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}>
          {/*  eslint-disable-next-line */}
          <a className="page-link">First</a>
        </li>
        <li
          className="page-item"
          onClick={() => previousPage()}
          disabled={!canPreviousPage}>
          {/*  eslint-disable-next-line */}
          <a className="page-link">{'<'}</a>
        </li>
        <li>
          {/*  eslint-disable-next-line */}
          <a className="page-link">
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </a>
        </li>
        <li
          className="page-item"
          onClick={() => nextPage()}
          disabled={!canNextPage}>
          {/*  eslint-disable-next-line */}
          <a className="page-link">{'>'}</a>
        </li>
        <li
          className="page-item"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}>
          {/*  eslint-disable-next-line */}
          <a className="page-link">Last</a>
        </li>
        <li>
          {/*  eslint-disable-next-line */}
          <a className="page-link">
            <input
              className="form-control"
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{width: '100px', height: '20px'}}
            />
          </a>
        </li>{' '}
        <select
          className="form-control"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          style={{width: '120px', height: '38px'}}>
          {[5, 10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </ul>
    </div>
  );
};

const TableComponent = (props) => {
  const [columns] = useState([
    {
      Header: 'Table',
      columns: [
        {
          Header: 'Sub Category',
          accessor: 'subcategory',
        },
        {
          Header: 'Title',
          accessor: 'title',
        },
        {
          Header: 'Price',
          accessor: 'price',
        },
        {
          Header: 'Popularity',
          accessor: 'popularity',
        },
      ],
    },
  ]);
  const [gdata, setdata] = useState();
  useEffect(() => {
    getData(); // eslint-disable-next-line
  }, []);
  const sortByAge = (array) => {
    const sorted = array.sort((a, b) => {
      return b.price - a.price;
    });
    setdata(sorted);
  };
  const getData = () => {
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
      targetUrl =
        'https://mindler-dashboard.s3.us-east-2.amazonaws.com/products.json';

    fetch(proxyUrl + targetUrl)
      .then((response) => response.json())
      .then((resData) => {
        // eslint-disable-next-line
        let tmpArray = [];
        // eslint-disable-next-line
        for (const [key, value] of Object.entries(resData.products)) {
          tmpArray.push(value);
        }
        sortByAge(tmpArray);
      });
  };
  if (gdata) return <Table columns={columns} data={gdata} />;
  return null;
};

export default TableComponent;
