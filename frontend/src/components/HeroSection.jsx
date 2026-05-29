import React from 'react'
import { Button } from './ui/button'
import { IoIosArrowRoundDown } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className='bg-linear-to-br from-background to-primary/20 font-nunito-sans w-full flex items-center justify-center flex-col min-h-160'>
      <span className='text-foreground text-4xl text-center md:text-7xl font-semibold'>Connecting people for a</span><br/>
      <span className='text-4xl md:text-7xl bg-linear-to-br from-primary to-secondary font-semibold bg-clip-text text-transparent'>healthier tomorrow.</span>
      <p className='w-100 md:w-190 text-center mt-5 text-md tracking-wide text-foreground'>SwasthaSangai connects people, resources, and experts to empower healthier lifestyles through guidance, support, and community engagement.</p>
      <div className='flex gap-2 p-4'>
        <Button variant={'default'} className={'cursor-pointer'}>Get Started</Button>
        <Button variant={'outline'} className={'cursor-pointer'}>
            <IoIosArrowRoundDown />
            <span onClick={()=>{navigate('/home/dashboard')}}>Learn More</span>
        </Button>
      </div>
    </div>
  )
}

export default HeroSection