import { Card, CardMedia, CardContent, Chip, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';

 const CourseCard = ({ course }) => {
  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card className="h-full">
        <CardMedia
          component="img"
          height="140"
          image={course.image || '/default-course.jpg'}
          alt={course.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h6">{course.title}</Typography>
          <div className="flex flex-wrap gap-2 mb-3">
            <Chip label={course.difficulty} size="small" />
            <Chip label={`${course.lessons} Lessons`} size="small" />
          </div>
          <Button
            fullWidth
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Enroll Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default CourseCard;
