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
-- Table structure for table `lab_progress`
--

CREATE TABLE `lab_progress` (
  `id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `score` int NOT NULL DEFAULT '0',
  `questionId` int NOT NULL,
  `enrollmentId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lab_progress`
--

INSERT INTO `lab_progress` (`id`, `is_completed`, `score`, `questionId`, `enrollmentId`) VALUES
(4698, 1, 1, 401, 254),
(4699, 1, 0, 402, 254),
(4700, 1, 0, 403, 254),
(4701, 1, 1, 404, 254),
(4702, 1, 1, 416, 254),
(4703, 0, 0, 571, 254),
(4704, 0, 0, 572, 254),
(4705, 0, 0, 573, 254),
(4706, 0, 0, 574, 254),
(4707, 0, 0, 575, 254),
(4708, 0, 0, 576, 254),
(4709, 0, 0, 577, 254),
(4710, 0, 0, 578, 254),
(4711, 0, 0, 579, 254),
(4712, 0, 0, 580, 254),
(4713, 0, 0, 581, 254),
(4714, 0, 0, 582, 254),
(4715, 0, 0, 583, 254),
(4716, 0, 0, 584, 254),
(4717, 0, 0, 585, 254),
(4718, 0, 0, 586, 254),
(4719, 0, 0, 587, 254);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lab_progress`
--
ALTER TABLE `lab_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_enroll` (`enrollmentId`) USING BTREE,
  ADD KEY `lab_id` (`questionId`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lab_progress`
--
ALTER TABLE `lab_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4720;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lab_progress`
--
ALTER TABLE `lab_progress`
  ADD CONSTRAINT `lab_enroll` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lab_id` FOREIGN KEY (`questionId`) REFERENCES `labs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
