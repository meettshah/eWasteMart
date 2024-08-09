import React from 'react'
import Chips from './Chips'

const FrontPage = () => {
  return (
    <>
      <div className='w-full bg-white dark:bg-black top-[65px] absolute h-screen'>
        <div className='absolute w-[24rem] h-72 bg-violet-500 opacity-90 bottom-[20%] right-[10%] rounded-3xl blur-3xl'></div>
        <div className='absolute w-[24rem] h-72 bg-pink-500 opacity-90 top-[20%] left-[10%] rounded-3xl blur-3xl'></div>
      </div>
      <div className="h-screen flex flex-col  gap-1 justify-center items-center ">
        <Chips title={'We Provide Great Services'} />
        <h1 className='text-[3rem] mb-8 text-black dark:text-white z-20 font-bold'>
          Welcome to the E-WasteMart
        </h1>
        <p className='w-2/3 text-black dark:text-white text-center z-20'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Praesentium, voluptas distinctio quasi autem maiores velit neque tempore! Laboriosam numquam deserunt laudantium voluptatem dolore. Laudantium nobis, quae repellendus laboriosam repudiandae distinctio!</p>
      </div>
    </>
  )
}

export default FrontPage