-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Nov 08, 2024 at 03:54 PM
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
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `Email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Role` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT 'User',
  `OTP` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `OTP_EXP` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`Email`, `Password`, `Name`, `Role`, `OTP`, `OTP_EXP`) VALUES
('AAA', '$2b$10$rvhN7NsLbTUWbQJTM7kSpOyqlb2MQRA7HzlmJVu3ng6kO8Ho8KWN6', 'a', 'Student', '-', NULL),
('ABC', '$2b$10$HIwLXl6PTS7A0qspbP8agOsSMCI5fpi67RLHz0.IWArmSuHOWHeoe', 'akakak', 'Student', '-', NULL),
('Test', '$2b$10$zq.K1KnpA4ugzBMufliFyu/soLUEKgtGv.RLP2Idq7EAVGtEhh5ly', 'asdv', 'Student', '-', NULL),
('admin', '$2b$10$4//6S5EIBVirOXvGeS/qHuGnE6jGt6kFZK3tT97vDCeRu44jv0y.a', 'Admin Inwza', 'Admin', '-', NULL),
('arcarnupab@gmail.com', '$2b$10$2k5dhsEK8ZVeTXl4sz6kZeeTmFjO3F7dWC3Cj.IYWKppwlWWh0MmG', 'Arc', 'Student', '759528', '2024-09-29 18:23:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`Email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
