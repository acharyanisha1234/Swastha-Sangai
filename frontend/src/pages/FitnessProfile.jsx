import React, { useEffect, useState, useContext } from 'react'
import ProfileHeader from '../components/userFitnessProfile/ProfileHeader'
import WorkoutLogModal from '../components/WorkoutLogModal'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

const FitnessProfile = () => {
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(10);
    const { backendUrl } = useContext(AuthContext);

    useEffect(() => {
        document.documentElement.classList.add("dark");
        fetchStreak();
    }, []);

    const fetchStreak = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/workout/streak`, { withCredentials: true });
            if (response.data?.streak) {
                setCurrentStreak(response.data.streak);
            }
        } catch (error) {
            console.error('Error fetching streak:', error);
        }
    };

    const handleWorkoutSuccess = (data) => {
        if (data.streak) {
            setCurrentStreak(data.streak);
        }
        fetchStreak();
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <ProfileHeader 
                        onStreakClick={() => setIsWorkoutModalOpen(true)} 
                        currentStreak={currentStreak}
                    />
                </div>
            </div>
            
            <WorkoutLogModal 
                isOpen={isWorkoutModalOpen}
                onClose={() => setIsWorkoutModalOpen(false)}
                onSuccess={handleWorkoutSuccess}
                backendUrl={backendUrl}
            />
        </div>
    )
}

export default FitnessProfile