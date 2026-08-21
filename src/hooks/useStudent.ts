import { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types/student';
import { getStudentsList } from '../firebase/students';

export type FilterStatus = 'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'LOCKED' | 'ONLINE';

export function useStudent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudentsList();
      setStudents(data);
    } catch (e) {
      console.error("Error fetching students:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    // Poll students every 15 seconds to update real-time online heartbeat status
    const interval = setInterval(fetchStudents, 15000);
    return () => clearInterval(interval);
  }, [fetchStudents]);

  // Statistics
  const stats = useMemo(() => {
    const now = Date.now();
    let total = students.length;
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let locked = 0;
    let online = 0;

    students.forEach(s => {
      const expTime = new Date(s.expiresAt).getTime();
      const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
      
      // Online check: activeSession exists & lastHeartbeat within 90s (90000ms)
      const isOnline = s.activeSession && (now - s.activeSession.lastHeartbeat <= 90000);
      if (isOnline) online++;

      if (s.status === 'locked') {
        locked++;
      } else if (diffDays <= 0 || s.status === 'expired') {
        expired++;
      } else {
        active++;
        if (diffDays <= 7) {
          expiringSoon++;
        }
      }
    });

    return { total, active, expiringSoon, expired, locked, online };
  }, [students]);

  // Filtered and Searched Students List
  const filteredStudents = useMemo(() => {
    const now = Date.now();
    const query = searchQuery.toLowerCase().trim();

    return students.filter(student => {
      // Search match (fullName, username, phone, email)
      const matchesSearch = !query ||
        student.fullName.toLowerCase().includes(query) ||
        student.username.toLowerCase().includes(query) ||
        student.phone.includes(query) ||
        student.email.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const expTime = new Date(student.expiresAt).getTime();
      const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
      const isOnline = student.activeSession && (now - student.activeSession.lastHeartbeat <= 90000);

      switch (filter) {
        case 'ACTIVE':
          return student.status === 'active' && diffDays > 0;
        case 'EXPIRING_SOON':
          return student.status === 'active' && diffDays > 0 && diffDays <= 7;
        case 'EXPIRED':
          return student.status === 'expired' || diffDays <= 0;
        case 'LOCKED':
          return student.status === 'locked';
        case 'ONLINE':
          return isOnline;
        case 'ALL':
        default:
          return true;
      }
    });
  }, [students, searchQuery, filter]);

  return {
    students,
    filteredStudents,
    loading,
    stats,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    refreshStudents: fetchStudents
  };
}
