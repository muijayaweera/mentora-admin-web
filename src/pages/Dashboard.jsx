import { useEffect, useMemo, useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Activity,
  Loader2,
  Target,
  Trophy,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import {
  collection,
  collectionGroup,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function StatCard({ title, value, Icon, note }) {
  return (
    <div className="bg-white rounded-[28px] px-6 py-5 border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-medium text-gray-400 mb-2">{title}</p>
          <h3 className="text-[26px] font-semibold text-gray-950 leading-none">{value}</h3>
          <p className="text-[12px] text-gray-400 mt-4">{note}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[#F7EAFE] flex items-center justify-center">
          <Icon size={21} strokeWidth={2} className="text-[#B72AD7]" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`bg-white rounded-[30px] p-6 border border-[#F0EAF7] shadow-[0_12px_35px_rgba(30,20,60,0.04)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-[19px] font-semibold text-gray-950">{title}</h3>
          {subtitle && <p className="text-[14px] text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function MiniMetric({ label, value, icon: Icon, tone = "purple" }) {
  const styles = {
    purple: "bg-[#F7EAFE] text-[#B72AD7]",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${styles[tone]}`}>
          <Icon size={18} strokeWidth={2.1} />
        </div>
        <div>
          <p className="text-[14px] text-gray-400">{label}</p>
          <p className="text-[18px] font-semibold text-gray-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value?.toDate) return "Recently";
  return value.toDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [usersData, setUsersData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [imageReviews, setImageReviews] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [moduleCount, setModuleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsersData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubImages = onSnapshot(
      query(collection(db, "imageReviews"), orderBy("uploadedOn", "desc")),
      (snapshot) => {
        setImageReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    const unsubQuizAttempts = onSnapshot(collectionGroup(db, "quizAttempts"), (snapshot) => {
      setQuizAttempts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCourses = onSnapshot(collection(db, "courses"), async (snapshot) => {
      const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCoursesData(courses);

      let totalModules = 0;
      for (const course of courses) {
        const modulesSnap = await getDocs(collection(db, "courses", course.id, "modules"));
        totalModules += modulesSnap.size;
      }
      setModuleCount(totalModules);
    });

    return () => {
      unsubUsers();
      unsubImages();
      unsubQuizAttempts();
      unsubCourses();
    };
  }, []);

  const stats = useMemo(() => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter((u) => u.disabled !== true && u.status !== "Disabled").length;

    const totalCourses = coursesData.length;
    const publishedCourses = coursesData.filter((c) => c.status === "published" || c.isPublished === true).length;

    const totalImages = imageReviews.length;
    const pendingImages = imageReviews.filter((img) => img.status === "Pending Review").length;
    const reviewedImages = imageReviews.filter(
      (img) => img.status === "Reviewed" || img.status === "Approved for Retraining" || img.status === "Rejected"
    ).length;

    const imageReviewCompletion = totalImages === 0 ? 0 : Math.round((reviewedImages / totalImages) * 100);

    const totalQuizAnswers = quizAttempts.length;
    const correctAnswers = quizAttempts.filter((attempt) => attempt.isCorrect === true).length;
    const quizSuccessRate = totalQuizAnswers === 0 ? 0 : Math.round((correctAnswers / totalQuizAnswers) * 100);

    let completedCourses = 0;
    let totalCourseProgressEntries = 0;

    usersData.forEach((user) => {
      Object.values(user.courseProgress || {}).forEach((courseProgress) => {
        totalCourseProgressEntries++;
        if (courseProgress.completed === true) completedCourses++;
      });
    });

    const courseCompletionRate =
      totalCourseProgressEntries === 0
        ? 0
        : Math.round((completedCourses / totalCourseProgressEntries) * 100);

    return {
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalImages,
      pendingImages,
      reviewedImages,
      imageReviewCompletion,
      totalQuizAnswers,
      correctAnswers,
      quizSuccessRate,
      completedCourses,
      totalCourseProgressEntries,
      courseCompletionRate,
      latestCourse: coursesData[0],
    };
  }, [usersData, coursesData, imageReviews, quizAttempts]);

  const cards = [
    {
      title: "Total Users",
      value: loading ? "..." : stats.totalUsers,
      icon: Users,
      note: "Registered platform users",
    },
    {
      title: "Total Courses",
      value: loading ? "..." : stats.totalCourses,
      icon: BookOpen,
      note: `${stats.publishedCourses} published courses`,
    },
    {
      title: "Quiz Success Rate",
      value: loading ? "..." : `${stats.quizSuccessRate}%`,
      icon: Target,
      note: `${stats.correctAnswers} correct answers recorded`,
    },
    {
      title: "Course Completion",
      value: loading ? "..." : `${stats.courseCompletionRate}%`,
      icon: Trophy,
      note: `${stats.completedCourses} completed course records`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-8 py-8">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <h2 className="text-[36px] sm:text-[42px] font-semibold text-gray-950 tracking-tight leading-tight">
              Admin Dashboard
            </h2>
          </div>

          <div className="bg-white rounded-[24px] border border-[#F0EAF7] px-5 py-4 shadow-[0_12px_35px_rgba(30,20,60,0.04)]">
            <p className="text-[13px] text-gray-400">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-[15px] font-semibold text-gray-950">Connected to Firebase</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[#B72AD7] text-[14px] font-semibold">
            <Loader2 size={18} className="animate-spin" />
            Loading dashboard data...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((c) => (
            <StatCard key={c.title} title={c.title} value={c.value} Icon={c.icon} note={c.note} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
  <Card
    title="Image Recognition Details"
    subtitle="Review status of uploaded ostomy images"
    right={
      <span className="rounded-full bg-green-50 text-green-700 px-4 py-2 text-[13px] font-semibold">
        Live data
      </span>
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MiniMetric
        label="Total Images"
        value={stats.totalImages}
        icon={ImageIcon}
        tone="purple"
      />
      <MiniMetric
        label="Reviewed"
        value={stats.reviewedImages}
        icon={CheckCircle2}
        tone="green"
      />
      <MiniMetric
        label="Pending"
        value={stats.pendingImages}
        icon={AlertCircle}
        tone="orange"
      />
    </div>

    <div className="mt-5">
      <div className="flex justify-between text-[14px] mb-2">
        <span className="text-gray-500">Review Completion</span>
        <span className="font-semibold text-gray-950">
          {stats.imageReviewCompletion}%
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#D946EF] to-[#A855F7]"
          style={{ width: `${stats.imageReviewCompletion}%` }}
        />
      </div>
    </div>
  </Card>

  <Card
    title="Course Activity Overview"
    subtitle="Course and module status from Firestore"
    right={
      <span className="rounded-full bg-[#F7EAFE] text-[#B72AD7] px-4 py-2 text-[13px] font-semibold">
        {moduleCount} modules
      </span>
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MiniMetric
        label="Total Courses"
        value={stats.totalCourses}
        icon={BookOpen}
        tone="purple"
      />
      <MiniMetric
        label="Published Courses"
        value={stats.publishedCourses}
        icon={CheckCircle2}
        tone="green"
      />
    </div>

    <div className="mt-4 rounded-[24px] bg-gradient-to-br from-[#D946EF] to-[#9333EA] p-5 text-white shadow-[0_16px_35px_rgba(168,85,247,0.18)]">
      <p className="text-[14px] text-white/75">Latest Course</p>
      <h4 className="font-semibold text-[19px] mt-1 leading-tight">
        {stats.latestCourse?.title ||
          stats.latestCourse?.courseTitle ||
          "No course added yet"}
      </h4>
      <p className="text-[14px] text-white/80 mt-3">
        {stats.latestCourse?.createdAt
          ? `Added ${formatDateTime(stats.latestCourse.createdAt)}`
          : "Course data will appear here"}
      </p>
    </div>
  </Card>

  <Card title="User Activity" subtitle="Registered user overview">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MiniMetric
        label="Total Users"
        value={stats.totalUsers}
        icon={Users}
        tone="purple"
      />
      <MiniMetric
        label="Active Users"
        value={stats.activeUsers}
        icon={Activity}
        tone="green"
      />
    </div>

    <div className="mt-5 rounded-[24px] bg-[#FCFBFE] border border-[#F2EDF8] p-4">
      <p className="text-[14px] text-gray-400">User Status</p>
      <p className="text-[15px] text-gray-600 mt-2">
        {stats.activeUsers} out of {stats.totalUsers} registered users are
        currently active.
      </p>
    </div>
  </Card>

  <Card
    title="Learning Activity Overview"
    subtitle="Summary of quiz and course progress"
    right={
      <span className="rounded-full bg-[#F7EAFE] text-[#B72AD7] px-4 py-2 text-[13px] font-semibold">
        Summary
      </span>
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MiniMetric
        label="Quiz Answers"
        value={stats.totalQuizAnswers}
        icon={Target}
        tone="purple"
      />
      <MiniMetric
        label="Correct Answers"
        value={stats.correctAnswers}
        icon={CheckCircle2}
        tone="green"
      />
      <MiniMetric
        label="Completed Courses"
        value={stats.completedCourses}
        icon={Trophy}
        tone="orange"
      />
      <MiniMetric
        label="Progress Records"
        value={stats.totalCourseProgressEntries}
        icon={TrendingUp}
        tone="blue"
      />
    </div>

    <div className="mt-5">
      <div className="flex justify-between text-[14px] mb-2">
        <span className="text-gray-500">Quiz Success Rate</span>
        <span className="font-semibold text-gray-950">
          {stats.quizSuccessRate}%
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#D946EF] to-[#A855F7]"
          style={{ width: `${stats.quizSuccessRate}%` }}
        />
      </div>
    </div>

    <div className="mt-4">
      <div className="flex justify-between text-[14px] mb-2">
        <span className="text-gray-500">Course Completion Rate</span>
        <span className="font-semibold text-gray-950">
          {stats.courseCompletionRate}%
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
          style={{ width: `${stats.courseCompletionRate}%` }}
        />
      </div>
    </div>
  </Card>
</div>
      </div>
    </div>
  );
}