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
-- Table structure for table `question_logs`
--

CREATE TABLE `question_logs` (
  `id` int NOT NULL,
  `user_answer` longtext NOT NULL,
  `progressId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `question_logs`
--

INSERT INTO `question_logs` (`id`, `user_answer`, `progressId`) VALUES
(244, 'มุ่งเป้าไปที่บุคคลหรือองค์กรเฉพาะเจาะจง', 458),
(245, 'เว็บไซต์ที่มีระบบยืนยันตัวตนแบบ 2 ขั้นตอน', 459),
(246, 'ป้อนข้อมูลส่วนตัวลงในเว็บไซต์ที่ไม่ได้เข้ารหัส', 456),
(247, 'ถูกทุกข้อ', 455),
(248, 'ซอฟต์แวร์ที่แสดงข้อความหลอกให้เหยื่อตกใจและดำเนินการตามคำสั่ง', 457);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `question_logs`
--
ALTER TABLE `question_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_record` (`progressId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `question_logs`
--
ALTER TABLE `question_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=249;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `question_logs`
--
ALTER TABLE `question_logs`
  ADD CONSTRAINT `question_record` FOREIGN KEY (`progressId`) REFERENCES `question_progress` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
