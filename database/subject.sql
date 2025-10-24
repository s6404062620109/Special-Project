-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Oct 24, 2025 at 01:37 PM
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
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `courseId` int NOT NULL,
  `createat` datetime NOT NULL,
  `updateat` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`id`, `name`, `courseId`, `createat`, `updateat`) VALUES
(111, 'Introduction', 71, '2025-05-30 21:07:30', '2025-10-10 02:05:25'),
(112, 'Phishing', 71, '2025-05-30 21:24:51', '2025-10-06 16:42:45'),
(114, 'SPAM', 71, '2025-05-30 22:42:53', '2025-10-24 03:17:43'),
(115, 'Baiting', 71, '2025-05-30 22:51:03', '2025-10-06 16:43:41'),
(117, 'Technical Support Scams', 71, '2025-05-30 23:05:03', '2025-10-06 16:44:13'),
(118, 'Scareware', 71, '2025-05-30 23:13:41', '2025-10-06 16:44:38'),
(119, 'Introduction', 72, '2025-05-30 23:16:48', '2025-10-10 02:05:53'),
(120, 'Virus', 72, '2025-05-30 23:18:09', '2025-10-08 12:08:52'),
(121, 'Worm', 72, '2025-05-30 23:20:29', '2025-10-08 12:09:31'),
(122, 'Trojan horse ', 72, '2025-05-30 23:22:19', '2025-10-08 12:10:15'),
(123, 'Spyware ', 72, '2025-05-30 23:35:21', '2025-10-08 12:10:39'),
(124, 'Adware ', 72, '2025-05-30 23:36:44', '2025-10-08 12:11:23'),
(125, 'Ransomware ', 72, '2025-05-30 23:38:14', '2025-10-08 12:11:52'),
(126, 'DDos Attack ', 73, '2025-05-30 23:40:23', '2025-10-08 12:18:27'),
(127, 'Man-in-the-middle (mitm) attack ', 74, '2025-05-30 23:42:24', '2025-10-21 14:07:18'),
(128, 'กฏหมายที่เกี่ยวข้องกับ Cybersecurity', 75, '2025-05-30 23:44:42', '2025-10-08 12:29:05'),
(129, 'Password management ', 76, '2025-05-30 23:46:53', '2025-10-08 12:34:50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `in_course` (`courseId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `in_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
