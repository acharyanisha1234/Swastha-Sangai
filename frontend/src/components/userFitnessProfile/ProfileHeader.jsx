import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Pencil, Check, X, Goal, Flame, Camera, TrendingUp, Award, Target, Zap, Heart, Scale, Ruler, Mail, User } from "lucide-react";

export default function ProfileHeader({ onStreakClick, currentStreak = 10 }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { backendUrl, userData, getUserData, setUserData } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const nextMilestone = Math.ceil((currentStreak + 1) / 7) * 7;
    const daysToNextMilestone = nextMilestone - currentStreak;
    const progressPercent = (currentStreak / 30) * 100;

    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        age: "",
        weight: "",
        height: "",
        goal: "",
        profileImage: ""
    });

    useEffect(() => {
        if (userData) {
            setProfile({
                fullName: userData.fullName || "Nisha Acharya",
                email: userData.email || "acharyanisha@gmail.com",
                age: userData.age || "24",
                weight: userData.weight || "55",
                height: userData.height || "5.6",
                goal: userData.goal || "Muscle Gain",
                profileImage: userData.profileImage || ""
            });
        }
    }, [userData]);

    const handleChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const uploadProfileImage = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const response = await axios.post(`${backendUrl}/api/user/upload-profile-image`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setProfile(prev => ({ ...prev, profileImage: response.data.imageUrl }));
                toast.success('Profile picture updated!');
                if (setUserData) {
                    setUserData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadProfileImage(file);
        }
    };

    const saveProfile = async () => {
        try {
            await axios.put(`${backendUrl}/api/user/update-profile`,
                { fullName: profile.fullName, email: profile.email },
                { withCredentials: true }
            );
            await axios.put(`${backendUrl}/api/user/update-fitness-profile`,
                { age: profile.age, weight: profile.weight, height: profile.height, goal: profile.goal },
                { withCredentials: true }
            );
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            await getUserData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        }
    };

    const cancelEdit = () => {
        if (userData) {
            setProfile({
                fullName: userData.fullName || "Nisha Acharya",
                email: userData.email || "acharyanisha@gmail.com",
                age: userData.age || "24",
                weight: userData.weight || "55",
                height: userData.height || "5.6",
                goal: userData.goal || "Muscle Gain",
                profileImage: userData.profileImage || ""
            });
        }
        setIsEditing(false);
    };

    const getInitials = () => {
        return profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'N';
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Profile Header */}
                    <div className="relative">
                        <div className="h-24 bg-gradient-to-r from-green-400 to-green-600"></div>
                        <div className="absolute -bottom-12 left-6">
                            <div className="relative">
                                <div 
                                    className="w-24 h-24 rounded-full overflow-hidden cursor-pointer ring-4 ring-white shadow-lg"
                                    onClick={handleImageClick}
                                >
                                    {profile.profileImage ? (
                                        <img 
                                            src={`${backendUrl}${profile.profileImage}`} 
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {getInitials()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        {isUploading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <Camera className="text-white" size={18} />
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleImageClick}
                                    className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white hover:bg-green-600"
                                >
                                    <Pencil className="text-white" size={10} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-16 pb-6 px-6">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={profile.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className="text-xl font-bold w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="text-sm text-gray-500 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{profile.fullName}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                            </>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="text-center">
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={profile.age}
                                        onChange={(e) => handleChange('age', e.target.value)}
                                        className="text-2xl font-bold text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg px-2 py-1 w-full"
                                    />
                                ) : (
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.age}</div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">Age</div>
                            </div>
                            <div className="text-center">
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={profile.weight}
                                        onChange={(e) => handleChange('weight', e.target.value)}
                                        className="text-2xl font-bold text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg px-2 py-1 w-full"
                                    />
                                ) : (
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.weight}</div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">Weight (kg)</div>
                            </div>
                            <div className="text-center">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profile.height}
                                        onChange={(e) => handleChange('height', e.target.value)}
                                        className="text-2xl font-bold text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg px-2 py-1 w-full"
                                    />
                                ) : (
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{profile.height}</div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">Height (ft)</div>
                            </div>
                        </div>

                        {/* Goal */}
                        <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Goal size={16} className="text-green-500" />
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Health Goal</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.goal}
                                    onChange={(e) => handleChange('goal', e.target.value)}
                                    className="text-base font-semibold w-full bg-transparent border-b-2 border-green-500 focus:outline-none mt-1"
                                />
                            ) : (
                                <div className="text-base font-semibold text-green-600 mt-1">{profile.goal}</div>
                            )}
                        </div>

                        {/* Edit Button */}
                        {isEditing ? (
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={saveProfile}
                                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={16} />
                                    Save
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full mt-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Pencil size={16} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column - Streak Card */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 rounded-xl p-2">
                                    <Award size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Streak Maintain</h3>
                                    <p className="text-white/70 text-xs">Keep going!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                                <Flame size={18} className="text-yellow-300" />
                                <span className="text-white font-bold text-xl">{currentStreak}</span>
                                <span className="text-white/70 text-xs">days</span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-5">
                            <div className="flex justify-between text-xs text-white/80 mb-1.5">
                                <span>30 days target</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div 
                                    className="bg-yellow-300 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Milestone */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <Target size={16} className="text-yellow-300 mx-auto mb-1" />
                                <div className="text-white font-bold text-lg">{nextMilestone}</div>
                                <div className="text-white/60 text-xs">Next Goal</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <Zap size={16} className="text-yellow-300 mx-auto mb-1" />
                                <div className="text-white font-bold text-lg">{daysToNextMilestone}</div>
                                <div className="text-white/60 text-xs">Days to go</div>
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            onClick={onStreakClick}
                            className="w-full bg-white hover:bg-white/90 text-orange-600 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                            <TrendingUp size={18} />
                            Log Today's Workout
                        </button>

                        {/* Message */}
                        <p className="text-center text-white/80 text-xs mt-4">
                            {daysToNextMilestone === 0 ? (
                                "🎉 Milestone achieved! Great job! 🎉"
                            ) : (
                                `${daysToNextMilestone} days to ${nextMilestone} day streak!`
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}