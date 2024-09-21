-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Sep 21, 2024 at 01:06 PM
-- Server version: 9.0.1
-- PHP Version: 8.2.8

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
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `SubjectID` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin,
  `Image_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Course-ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`SubjectID`, `Name`, `Content`, `Image_id`, `Course-ID`) VALUES
(1, 'Subject Test1', '1234567890qwertyuiopasdfghjkl;\'zxcvbnm,.   dgsaiyhcxbviagscygbiusdhaovijisdajfoisoaifhiewhgbdsvooisdafijdf', 'Icon', 1),
(2, 'Subject 2', 'ฟหัดักหเรีอปผี้ฆฺฏณ๊ฤฌโณ๊ฌ\"๊โฌฎ๊ณฏฆ็ฌฯณ็ฏฆโ+๑๒๓๔ู฿๕๖7523.', 'Icon', 1),
(3, 'Course 2 Subject 1', 'abcdef TESt 123456789423421245512123', 'Icon', 2),
(4, 'Course 2 Subject 2', 'abcdef TESt 123456789423421245512123', 'Icon', 2),
(5, 'Course 2 Subject 3', 'abcdef TESt 123456789423421245512123', 'Icon', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`SubjectID`),
  ADD KEY `Couese-ID_idx` (`Course-ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `SubjectID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `Couese-ID` FOREIGN KEY (`Course-ID`) REFERENCES `courses` (`CourseID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
