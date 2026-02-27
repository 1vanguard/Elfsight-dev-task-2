import { createContext, useContext } from 'react';

const DataContext = createContext({});

// eslint-disable-next-line import/no-unused-modules
export const useData = () => useContext(DataContext);
