-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Oct 17, 2025 at 01:37 PM
-- Server version: 9.4.0
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `SAT`
--

-- --------------------------------------------------------

--
-- Table structure for table `question_progress`
--

CREATE TABLE `question_progress` (
  `id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `score` int NOT NULL DEFAULT '0',
  `questionId` int NOT NULL,
  `type` varchar(10) NOT NULL,
  `enrollmentId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `question_progress`
--

INSERT INTO `question_progress` (`id`, `is_completed`, `score`, `questionId`, `type`, `enrollmentId`) VALUES
(455, 1, 1, 40, 'pre', 254),
(456, 1, 0, 37, 'pre', 254),
(457, 1, 1, 59, 'pre', 254),
(458, 1, 1, 28, 'pre', 254),
(459, 1, 0, 29, 'pre', 254),
(460, 0, 0, 30, 'post', 254),
(461, 0, 0, 43, 'post', 254),
(462, 0, 0, 28, 'post', 254),
(463, 0, 0, 29, 'post', 254),
(464, 0, 0, 35, 'post', 254);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `question_progress`
--
ALTER TABLE `question_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_enroll` (`enrollmentId`),
  ADD KEY `questionp_id` (`questionId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `question_progress`
--
ALTER TABLE `question_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=465;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `question_progress`
--
ALTER TABLE `question_progress`
  ADD CONSTRAINT `question_enroll` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `questionp_id` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
