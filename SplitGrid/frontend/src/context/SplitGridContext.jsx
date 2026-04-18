import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SplitGridContext = createContext();

export const useSplitGrid = () => useContext(SplitGridContext);

export const SplitGridProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [currentGroup, setCurrentGroup] = useState('demo-group');
  const [users, setUsers] = useState(['Bhoomika', 'Alex', 'Sam']);
  
  useEffect(() => {
    // Connect to backend server
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend:', newSocket.id);
      newSocket.emit('join_group', currentGroup);
    });

    newSocket.on('expense_added', (expense) => {
      console.log('Real-time expense received:', expense);
      setExpenses(prev => [expense, ...prev]);
    });

    return () => newSocket.close();
  }, [currentGroup]);

  // Fetch initial expenses
  useEffect(() => {
    fetch(`http://localhost:5001/api/expenses/${currentGroup}`)
      .then(res => res.json())
      .then(data => setExpenses(data))
      .catch(err => console.error('Error fetching expenses:', err));
  }, [currentGroup]);

  const addExpense = async (expenseData) => {
    try {
      const response = await fetch('http://localhost:5001/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseData, groupId: currentGroup })
      });
      if (!response.ok) throw new Error('Failed to add expense');
      // The socket event will trigger the setExpenses automatically
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SplitGridContext.Provider value={{ expenses, addExpense, currentGroup, users }}>
      {children}
    </SplitGridContext.Provider>
  );
};
