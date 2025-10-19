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
-- Table structure for table `lab_logs`
--

CREATE TABLE `lab_logs` (
  `id` int NOT NULL,
  `user_answer` longtext NOT NULL,
  `progressId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lab_logs`
--

INSERT INTO `lab_logs` (`id`, `user_answer`, `progressId`) VALUES
(1290, 'การโจมตีโดยใช้เทคนิคการหลอกลวงทางจิตวิทยา', 4698),
(1291, 'การแอบอ้างเป็นฝ่าย IT', 4699),
(1292, 'ใช้เทคนิคจาก Machine Learning', 4700),
(1293, 'ขโมยข้อมูลส่วนตัว', 4701),
(1294, 'ขู่กรรโชกหรือแบล็กเมล', 4701),
(1295, 'เก็บข้อมูลเพื่อวางแผนโจมตีเพิ่ม', 4701),
(1296, 'Report Email as Phishing', 4702);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lab_logs`
--
ALTER TABLE `lab_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_record` (`progressId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lab_logs`
--
ALTER TABLE `lab_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1297;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lab_logs`
--
ALTER TABLE `lab_logs`
  ADD CONSTRAINT `lab_record` FOREIGN KEY (`progressId`) REFERENCES `lab_progress` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
