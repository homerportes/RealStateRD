import React, { useState, useEffect } from 'react';
import { adminService } from './adminService';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import { format as formatDate } from 'date-fns';

const ConfigurationManager = () => {
  const [configurations, setConfigurations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    appointmentDurationMinutes: 30,
    shifts: []
  });

  // Helpers to handle safe local date parsing/formatting (avoid timezone shifts)
  const toYMD = (date) => (date ? formatDate(date, 'yyyy-MM-dd') : '');
  const parseYMD = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getConfigurations();
      if (result.success) {
        setConfigurations(result.data);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations before calling API
    if (!formData.startDate || !formData.endDate) {
      toast.error('Debes seleccionar las fechas de inicio y fin');
      return;
    }
    const sd = new Date(formData.startDate);
    const ed = new Date(formData.endDate);
    if (ed < sd) {
      toast.error('La Fecha de Fin no puede ser menor que la Fecha de Inicio');
      return;
    }
    if (!Array.isArray(formData.shifts) || formData.shifts.length === 0) {
      toast.error('Debes agregar al menos un turno');
      return;
    }
    if (formData.appointmentDurationMinutes < 5 || formData.appointmentDurationMinutes > 120) {
      toast.error('La duración debe estar entre 5 y 120 minutos');
      return;
    }

    setIsLoading(true);
    try {
      const result = editingConfig
        ? await adminService.updateConfiguration(editingConfig.id, formData)
        : await adminService.createConfiguration(formData);

      if (result.success) {
        await loadConfigurations();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      const result = await adminService.deleteConfiguration(id);
      if (result.success) {
        await loadConfigurations();
      }
    }
  };

  const handleGenerateSlots = async (configId) => {
    const result = await adminService.generateTimeSlots(configId);
    if (result.success) {
      toast.success('Slots generados exitosamente');
    }
  };

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      appointmentDurationMinutes: 30,
      shifts: []
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  const addShift = () => {
    setFormData(prev => ({
      ...prev,
      shifts: [...prev.shifts, {
        dayOfWeek: 1,
        type: 0,
        startTime: '09:00',
        endTime: '17:00',
        stationCount: 1
      }]
    }));
  };

  const updateShift = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.map((shift, i) => 
        i === index ? { ...shift, [field]: value } : shift
      )
    }));
  };

  const removeShift = (index) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.filter((_, i) => i !== index)
    }));
  };

  const editConfiguration = (config) => {
    setEditingConfig(config);
    setFormData({
      startDate: config.startDate.split('T')[0],
      endDate: config.endDate.split('T')[0],
      appointmentDurationMinutes: config.appointmentDurationMinutes,
      shifts: config.shifts.map(shift => ({
        dayOfWeek: shift.dayOfWeek,
        type: shift.type,
        startTime: shift.startTime,
        endTime: shift.endTime,
        stationCount: shift.stationCount
      }))
    });
    setShowForm(true);
  };

  const getDayName = (dayNumber) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNumber];
  };

  const getShiftTypeName = (type) => {
    return type === 0 ? 'Mañana' : 'Tarde';
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Gestión de Configuraciones</h2>
          <p className="text-slate-500 mt-1">Administra las configuraciones de reservas y turnos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>Nueva Configuración</span>
        </button>
      </div>

      {/* Configuration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-100">
                  {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fecha de Inicio
                    </label>
                    <DatePicker
                      selected={parseYMD(formData.startDate)}
                      onChange={(date) => {
                        setFormData((prev) => ({
                          ...prev,
                          startDate: toYMD(date),
                          // If endDate is before new startDate, clear or adjust it
                          endDate: prev.endDate && date && parseYMD(prev.endDate) < date ? toYMD(date) : prev.endDate,
                        }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Selecciona fecha de inicio"
                      className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                      calendarClassName="!bg-slate-900 !text-slate-100"
                      locale={es}
                      minDate={new Date()}
                      required
                      showPopperArrow={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fecha de Fin
                    </label>
                    <DatePicker
                      selected={parseYMD(formData.endDate)}
                      onChange={(date) => {
                        setFormData((prev) => ({
                          ...prev,
                          endDate: toYMD(date),
                        }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Selecciona fecha de fin"
                      className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                      calendarClassName="!bg-slate-900 !text-slate-100"
                      locale={es}
                      minDate={parseYMD(formData.startDate) || new Date()}
                      required
                      showPopperArrow={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={formData.appointmentDurationMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentDurationMinutes: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                      required
                    />
                  </div>
                </div>

                {/* Shifts Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-slate-100">Turnos</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Add Monday to Friday with morning and afternoon shifts
                          const weekdayShifts = [];
                          for (let day = 1; day <= 5; day++) { // Monday to Friday
                            // Morning shift (8:00 - 12:00)
                            weekdayShifts.push({
                              dayOfWeek: day,
                              type: 0, // Morning
                              startTime: '08:00',
                              endTime: '12:00',
                              stationCount: 3
                            });
                            // Afternoon shift (13:00 - 16:00)
                            weekdayShifts.push({
                              dayOfWeek: day,
                              type: 1, // Afternoon
                              startTime: '13:00',
                              endTime: '16:00',
                              stationCount: 3
                            });
                          }
                          setFormData(prev => ({
                            ...prev,
                            shifts: weekdayShifts
                          }));
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Configurar L-V (8-12, 1-4)</span>
                      </button>
                      <button
                        type="button"
                        onClick={addShift}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Agregar Turno</span>
                      </button>
                    </div>
                  </div>

                  {formData.shifts.map((shift, index) => (
                    <div key={index} className="border border-slate-900 bg-slate-950/60 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-slate-200">Turno {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeShift(index)}
                          className="text-red-300 hover:text-red-200 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Día
                          </label>
                          <select
                            value={shift.dayOfWeek}
                            onChange={(e) => updateShift(index, 'dayOfWeek', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                          >
                            {[0,1,2,3,4,5,6].map(day => (
                              <option key={day} value={day}>{getDayName(day)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Tipo
                          </label>
                          <select
                            value={shift.type}
                            onChange={(e) => updateShift(index, 'type', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                          >
                            <option value={0}>Mañana</option>
                            <option value={1}>Tarde</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Hora Inicio
                          </label>
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(e) => updateShift(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Hora Fin
                          </label>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(e) => updateShift(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Estaciones
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={shift.stationCount}
                            onChange={(e) => updateShift(index, 'stationCount', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-900 bg-slate-950 text-slate-100 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-800 rounded-md text-slate-200 hover:bg-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded-md hover:bg-slate-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Guardando...' : (editingConfig ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="rounded-lg border border-slate-900 bg-slate-950/60">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Configuraciones Existentes</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-transparent"></div>
            </div>
          ) : configurations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No hay configuraciones creadas</p>
              <p className="text-sm mt-1">Crea tu primera configuración para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <div key={config.id} className="border border-slate-900 rounded-lg p-4 bg-slate-950 hover:bg-slate-900/60 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium text-slate-100">
                          Configuración #{config.id}
                        </h4>
                        <span className="px-2 py-1 rounded-full text-xs border border-slate-800 text-slate-300 bg-slate-900/60">{config.appointmentDurationMinutes} min</span>
                        <span className="px-2 py-1 rounded-full text-xs border border-slate-800 text-slate-300 bg-slate-900/60">{config.timeSlotsCount} slots</span>
                      </div>
                      
                      <div className="text-sm text-slate-400 mb-3">
                        <span>{new Date(config.startDate).toLocaleDateString()} - {new Date(config.endDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {config.shifts.map((shift, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-900 text-slate-300 border border-slate-800 text-xs rounded">
                            {getDayName(shift.dayOfWeek)} {getShiftTypeName(shift.type)} ({shift.startTime}-{shift.endTime})
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleGenerateSlots(config.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm rounded transition-colors"
                      >
                        Generar Slots
                      </button>
                      <button
                        onClick={() => editConfiguration(config)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-sm rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-100 border border-red-900 text-sm rounded transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManager;
