import React, { useState, useRef } from 'react';
import { X, Camera, Clock, Check, Upload, Flame, AlertCircle, Activity } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WorkoutLogModal = ({ isOpen, onClose, onSuccess, backendUrl }) => {
    const [step, setStep] = useState(1);
    const [verificationMethod, setVerificationMethod] = useState(null);
    const [duration, setDuration] = useState('');
    const [workoutType, setWorkoutType] = useState('');
    const [workoutProof, setWorkoutProof] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const workoutTypes = [
        { value: 'cardio', label: 'Cardio', icon: '🏃', desc: 'Running, cycling, swimming' },
        { value: 'strength', label: 'Strength', icon: '💪', desc: 'Weight lifting, pushups' },
        { value: 'yoga', label: 'Yoga', icon: '🧘', desc: 'Yoga, stretching' },
        { value: 'hiit', label: 'HIIT', icon: '⚡', desc: 'High intensity training' }
    ];

    const handleMethodSelect = (method) => {
        setVerificationMethod(method);
        setStep(2);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setWorkoutProof(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const submitWorkout = async () => {
        if (!workoutType) {
            toast.error('Please select workout type');
            return;
        }
        if (verificationMethod === 'timer' && !duration) {
            toast.error('Please enter workout duration');
            return;
        }
        if (verificationMethod === 'photo' && !workoutProof) {
            toast.error('Please upload workout proof photo');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('method', verificationMethod);
        formData.append('duration', duration);
        formData.append('workoutType', workoutType);
        if (workoutProof) {
            formData.append('proof', workoutProof);
        }

        try {
            const response = await axios.post(`${backendUrl}/api/workout/log`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success(`Great job! 🔥 Streak: ${response.data.streak} days!`);
                if (onSuccess) onSuccess(response.data);
                resetForm();
                onClose();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.error || 'Failed to log workout');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setVerificationMethod(null);
        setDuration('');
        setWorkoutType('');
        setWorkoutProof(null);
        setProofPreview(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="text-green-500" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Log Workout</h2>
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                                How do you want to verify your workout?
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleMethodSelect('timer')}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-all flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <Clock className="text-blue-500" size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold">Workout Timer</div>
                                        <div className="text-sm text-gray-500">Log duration of your workout</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleMethodSelect('photo')}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-all flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Camera className="text-green-500" size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold">Photo Proof</div>
                                        <div className="text-sm text-gray-500">Upload a photo of your workout</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Workout Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Workout Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {workoutTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => setWorkoutType(type.value)}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                workoutType === type.value
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{type.icon}</div>
                                            <div className="font-medium text-sm">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timer */}
                            {verificationMethod === 'timer' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        placeholder="Enter minutes"
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            )}

                            {/* Photo */}
                            {verificationMethod === 'photo' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Workout Photo
                                    </label>
                                    <div 
                                        onClick={() => fileInputRef.current.click()}
                                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 transition-all"
                                    >
                                        {proofPreview ? (
                                            <img src={proofPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                                        ) : (
                                            <>
                                                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-gray-500">Click to upload workout photo</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            {/* Warning */}
                            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    Verification required. Fake submissions will reset your streak.
                                </p>
                            </div>

                            <button
                                onClick={submitWorkout}
                                disabled={isLoading || !workoutType}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Complete Workout
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutLogModal;