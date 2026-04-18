import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getGroup, addExpense, addSettlement, deleteExpense } from '../api';
import { socket, joinGroup, onGroupUpdated } from '../socket';

const GroupContext = createContext();

export const useGroup = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevGroupRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    getGroup(id)
      .then(res => {
        setGroup(res.data);
        prevGroupRef.current = res.data;
        setLoading(false);
        joinGroup(id);
      })
      .catch(err => {
        setLoading(false);
        if (err.response?.status === 404) {
          toast.error('Group not found');
          navigate('/');
        } else {
          toast.error('Connection error. Retrying...');
        }
      });

    const cleanup = onGroupUpdated((updatedData) => {
      setGroup(prev => {
        prevGroupRef.current = prev;
        return updatedData;
      });
    });

    return () => {
      cleanup();
    };
  }, [id, navigate]);

  // Toast Listener when group updates
  useEffect(() => {
    const prev = prevGroupRef.current;
    if (prev && group) {
      if (group.expenses.length > prev.expenses.length) {
        const newExp = group.expenses[group.expenses.length - 1];
        toast(`${newExp.paidBy} added ${newExp.item} ₹${newExp.amount}`, {
          icon: newExp.category,
          style: { background: '#13131A', color: '#fff', border: '1px solid #00F5A0' }
        });
      }
      const prevSettlements = prev.settlements?.length || 0;
      const currentSettlements = group.settlements?.length || 0;
      if (currentSettlements > prevSettlements) {
        const newSet = group.settlements[currentSettlements - 1];
        toast(`${newSet.from} paid ${newSet.to} ₹${newSet.amount}`, {
          icon: '✅',
          style: { background: '#13131A', color: '#fff', border: '1px solid #00F5A0' }
        });
      }
    }
  }, [group]);

  const handleAddExpense = async (data) => await addExpense(id, data);
  const handleAddSettlement = async (data) => await addSettlement(id, data);
  const handleDeleteExpense = async (expenseId) => await deleteExpense(id, expenseId);

  return (
    <GroupContext.Provider value={{ 
      group, 
      loading, 
      addExpense: handleAddExpense, 
      addSettlement: handleAddSettlement, 
      deleteExpense: handleDeleteExpense,
      socket
    }}>
      {children || <Outlet />}
    </GroupContext.Provider>
  );
};
