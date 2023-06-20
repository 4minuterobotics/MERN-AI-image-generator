import React from 'react'
import { motion } from 'framer-motion'

const animations = {
    initial: {opacity: 0, x: 100},
    animate: {opacity: 1, x: 0},
    exit: {opacity: 1, x: -100},
}

const PageAnimation = ({children}) => {
  return (
    <motion.div 
        variants={animations} 
        initial="initial" 
        animate="animate" 
        exit="exit"
        transition={{duration: 1.5}}
        >
        {children}
    </motion.div>
  )
}

export default PageAnimation