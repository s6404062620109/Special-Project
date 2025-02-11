-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Feb 11, 2025 at 02:24 PM
-- Server version: 9.1.0
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
-- Table structure for table `answer`
--

CREATE TABLE `answer` (
  `id` int NOT NULL,
  `content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` int NOT NULL,
  `questionId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `detail` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `icon_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `teacherId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `id` int NOT NULL,
  `courseId` int NOT NULL,
  `pretest_complete` tinyint(1) NOT NULL,
  `posttest_complete` tinyint(1) NOT NULL,
  `completed_labs` int NOT NULL,
  `total_labs` int NOT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL,
  `score` int NOT NULL,
  `questionId` int NOT NULL,
  `enrollmentId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `id` int NOT NULL,
  `content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `subjectId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `images` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `courseId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `role` char(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `profile_img` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `verified_key` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `verified_expired` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answer`
--
ALTER TABLE `answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answer_question` (`questionId`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teach_course` (`teacherId`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner` (`userId`),
  ADD KEY `enroll_course` (`courseId`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrol_progress` (`enrollmentId`),
  ADD KEY `question_progress` (`questionId`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `in_subject` (`subjectId`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `in_course` (`courseId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answer`
--
ALTER TABLE `answer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `answer_question` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `teach_course` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enroll_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`),
  ADD CONSTRAINT `owner` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `enrol_progress` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `question_progress` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `in_subject` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `in_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
