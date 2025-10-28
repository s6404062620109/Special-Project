-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Oct 28, 2025 at 06:40 PM
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
-- Table structure for table `course_tag`
--

CREATE TABLE `course_tag` (
  `courseId` int NOT NULL,
  `tagId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `course_tag`
--

INSERT INTO `course_tag` (`courseId`, `tagId`) VALUES
(71, 1),
(74, 1),
(103, 1),
(103, 2),
(71, 3),
(71, 4),
(103, 4),
(71, 5),
(72, 5),
(73, 5),
(103, 5),
(71, 6),
(72, 6),
(74, 6),
(103, 6),
(72, 7),
(73, 7),
(103, 7),
(71, 8),
(103, 8),
(103, 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `course_tag`
--
ALTER TABLE `course_tag`
  ADD PRIMARY KEY (`courseId`,`tagId`),
  ADD KEY `fk_course_tag_tag` (`tagId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_tag`
--
ALTER TABLE `course_tag`
  ADD CONSTRAINT `fk_course_tag_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_course_tag_tag` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
