import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api/students';

const emptyForm = {
  firstname: '',
  middlename: '',
  lastname: '',
  contact_number: '',
  course: '',
  year: ''
};

const fullName = (s) =>
  [s.firstname, s.middlename, s.lastname].filter(Boolean).join(' ');

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      setStudents(Array.isArray(data) ? data : (data.data || []));
      setError('');
    } catch {
      setError('Could not load students. Check that Laravel is running and CORS is configured.');
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Close the delete popup with the Escape key
  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e) => e.key === 'Escape' && setDeleteTarget(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteTarget]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setMessage('Student updated successfully.');
      } else {
        await axios.post(API_URL, form);
        setMessage('Student added successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Check the API and form data.');
    }
  };

  const editStudent = (student) => {
    setForm({
      firstname: student.firstname || '',
      middlename: student.middlename || '',
      lastname: student.lastname || '',
      contact_number: student.contact_number || '',
      course: student.course || '',
      year: String(student.year || '')
    });
    setEditingId(student.id);
    setMessage('');
    setError('');
  };

  const confirmDelete = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('Student deleted successfully.');
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadStudents();
    } catch {
      setError('Could not delete the student.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">LARAVEL API RESOURCE + REACT</p>
        <h1>Student Records</h1>
        <p className="subtitle">Manage student information through the Laravel REST API.</p>
      </header>

      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      <section className="panel">
        <h2>{editingId ? 'Update Student' : 'Add a Student'}</h2>
        <form onSubmit={handleSubmit} className="student-form">
          <label>First name
            <input name="firstname" value={form.firstname} onChange={handleChange} required />
          </label>
          <label>Middle name
            <input name="middlename" value={form.middlename} onChange={handleChange} />
          </label>
          <label>Last name
            <input name="lastname" value={form.lastname} onChange={handleChange} required />
          </label>
          <label>Contact number
            <input name="contact_number" value={form.contact_number} onChange={handleChange} required />
          </label>
          <label>Course
            <input name="course" value={form.course} onChange={handleChange} placeholder="e.g. BSIT" required />
          </label>
          <label>Year level
            <input name="year" value={form.year} onChange={handleChange} placeholder="e.g. 3" required />
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Save Changes' : 'Add Student'}</button>
            {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-heading">
          <h2>Student List</h2>
          <button className="secondary" onClick={loadStudents}>Refresh List</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Full Name</th><th>Contact</th>
                <th>Course</th><th>Year</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{fullName(student)}</td>
                  <td>{student.contact_number}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td className="actions">
                    <button className="small" onClick={() => editStudent(student)}>Edit</button>
                    <button className="small danger" onClick={() => setDeleteTarget(student)}>Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="6" className="empty">No student records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <footer>Student Records • React frontend connected to Laravel API</footer>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-title">Delete student?</h2>
            <p>
              <strong>{fullName(deleteTarget)}</strong> will be permanently removed.
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setDeleteTarget(null)} autoFocus>Cancel</button>
              <button className="danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}