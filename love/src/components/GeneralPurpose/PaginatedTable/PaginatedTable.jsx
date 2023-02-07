import React from 'react';
import SimpleTable from '../SimpleTable/SimpleTable';
import styles from './PaginatedTable.module.css';
import Button from '../Button/Button';
import Select from '../Select/Select';
import PropTypes from 'prop-types';
import { index } from 'd3';
import Input from '../Input/Input';
import { Search } from 'brace';
import RowExpansionIcon from 'components/icons/RowExpansionIcon/RowExpansionIcon';

const AVAILABLE_ITEMS_PER_PAGE = [10, 25, 50, 100];
/**
 * Adds pagination handlers to #SimpleTable.
 */
const PaginatedTable = ({ headers, data, paginationOptions, callBack, dataLen }) => {
  const availableItemsPerPage = paginationOptions ?? AVAILABLE_ITEMS_PER_PAGE;
  const [itemsPerPage, setItemsPerPage] = React.useState(availableItemsPerPage[0].toString());
  const [page, setPage] = React.useState(0);

  const length = data ? data.length : dataLen;
  const lastPage =
    length % itemsPerPage === 0 ? Math.floor(length / itemsPerPage) - 1 : Math.floor(length / itemsPerPage);

  const pageData = data ? data.slice(page * itemsPerPage, (page + 1) * itemsPerPage) : callBack(itemsPerPage, page);
  page * itemsPerPage;

  const goToFirst = () => {
    setPage(0);
  };

  const goToLast = () => {
    setPage(lastPage);
  };

  const goToNext = () => {
    setPage((page) => Math.min(page + 1, lastPage));
  };

  const goToPrevious = () => {
    setPage((page) => Math.max(page - 1, 0));
  };

  const goToPage = (pageNumber) => {
    setPage(pageNumber - 1);
  };

  const searchPage = (numString) => {
    const number = parseInt(numString, 10);
    if (number) setPage(number - 1);
  };

  const onSelectChange = (option) => {
    setItemsPerPage(option.value);
    setPage(0);
  };

  React.useEffect(() => {
    setPage(0);
  }, [JSON.stringify(data), JSON.stringify(headers)]);

  const feasibleItemsPerPage = availableItemsPerPage.filter((threshold) => length > threshold);

  const paginationLengthArray = lastPage < 2 ? [] : new Array(lastPage - 1).fill(0);

  return (
    <div>
      <SimpleTable headers={headers} data={pageData} />
      {feasibleItemsPerPage.length > 0 && (
        <div className={styles.paginationContainer}>
          <span className={styles.contentRange}>
            {page * itemsPerPage + 1}-{(page + 1) * itemsPerPage} of {length}
          </span>
          <div className={styles.selectPage}>
            <ul className={styles.pagination}>
              <li onClick={goToPrevious} className={styles.pageNumber}>
                <span className={styles.arrow}>&#60;</span>
              </li>
              <li key={1} onClick={() => goToPage(1)} className={styles.pageNumber}>
                {1}
              </li>
              {lastPage >= 6 ? (
                page > 3 && page < lastPage - 3 ? (
                  <>
                    <li
                      key={'pointsPrev'}
                      // onClick={() => goToPage(page)}
                      className={styles.pageNumber}
                    >
                      ...
                    </li>
                    <li key={page - 1} onClick={() => goToPage(page - 1)} className={styles.pageNumber}>
                      {page - 1}
                    </li>
                    <li key={page} onClick={() => goToPage(page)} className={styles.pageNumber}>
                      {page}
                    </li>
                    <li key={page + 1} onClick={() => goToPage(page + 1)} className={styles.pageNumber}>
                      {page + 1}
                    </li>
                    <li
                      key={'pointsNext'}
                      // onClick={() => goToPage(page)}
                      className={styles.pageNumber}
                    >
                      ...
                    </li>
                  </>
                ) : page < 3 ? (
                  <>
                    <li key={2} onClick={() => goToPage(2)} className={styles.pageNumber}>
                      2
                    </li>
                    <li key={3} onClick={() => goToPage(3)} className={styles.pageNumber}>
                      3
                    </li>
                    <li key={4} onClick={() => goToPage(4)} className={styles.pageNumber}>
                      4
                    </li>
                    <li key={5} onClick={() => goToPage(5)} className={styles.pageNumber}>
                      5
                    </li>
                    <li
                      key={'pointsNext'}
                      // onClick={() => goToPage(page)}
                      className={styles.pageNumber}
                    >
                      ...
                    </li>
                  </>
                ) : (
                  <>
                    <li
                      key={'pointsPrev'}
                      // onClick={() => goToPage(page)}
                      className={styles.pageNumber}
                    >
                      ...
                    </li>
                    <li key={lastPage - 3} onClick={() => goToPage(lastPage - 3)} className={styles.pageNumber}>
                      {lastPage - 3}
                    </li>
                    <li key={lastPage - 2} onClick={() => goToPage(lastPage - 2)} className={styles.pageNumber}>
                      {lastPage - 2}
                    </li>
                    <li key={lastPage - 2} onClick={() => goToPage(lastPage - 1)} className={styles.pageNumber}>
                      {lastPage - 1}
                    </li>
                    <li key={lastPage} onClick={() => goToPage(lastPage)} className={styles.pageNumber}>
                      {lastPage}
                    </li>
                  </>
                )
              ) : (
                paginationLengthArray.map((value, index) => {
                  return (
                    <li key={index + 2} onClick={() => goToPage(index + 2)} className={styles.pageNumber}>
                      {index + 2}
                    </li>
                  );
                })
              )}
              <li key={lastPage + 1} onClick={() => goToPage(lastPage + 1)} className={styles.pageNumber}>
                {lastPage + 1}
              </li>
              <li onClick={goToNext} className={styles.pageNumber}>
                <span className={styles.arrow}>&#62;</span>
              </li>
            </ul>
            <Input
              icon={<RowExpansionIcon></RowExpansionIcon>}
              iconButton={<RowExpansionIcon></RowExpansionIcon>}
              onClick={(n) => searchPage(n)}
              placeholder={'Go to page'}
            ></Input>
          </div>
        </div>
      )}
    </div>
  );
};

PaginatedTable.propTypes = {
  paginationOptions: PropTypes.arrayOf(PropTypes.number),
};
export default PaginatedTable;
