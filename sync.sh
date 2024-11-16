npm run build
echo Build Complete

s3cmd sync build/* s3://www.simonpainter.com/
echo Sync Complete

#s3cmd put --mime-type="text/css" build/assets/css/styles.0cf9d615.css s3://www.simonpainter.com/assets/css/
#echo Corrected CSS MIME Type
