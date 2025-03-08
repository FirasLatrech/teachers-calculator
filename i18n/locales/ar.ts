export default {
  translation: {
    calculator: {
      title: 'الحاسبة',
      register: 'تسجيل',
      clear: 'مسح',
      undo: 'تراجع',
      subtract: 'طرح',
      add: 'إضافة',
      clicks: 'العمليات',
      alerts: {
        noData: {
          title: 'لا توجد بيانات',
          message: 'لا توجد بيانات تقييم للحفظ.',
        },
        noName: {
          title: 'لا يوجد اسم',
          message: 'الرجاء إدخال اسم الطالب.',
        },
        saveSuccess: {
          title: 'نجاح',
          firstLine: 'تم حفظ الجلسة بنجاح!',
          secondLine: 'مجموع النقاط:',
          thirdLine: 'عدد العمليات:',
          studentName: 'اسم الطالب',
        },
        saveError: {
          title: 'خطأ',
          message: 'فشل في حفظ جلسة التقييم. يرجى المحاولة مرة أخرى.',
        },
      },
      enterStudentName: 'أدخل اسم الطالب',
      studentName: 'اسم الطالب',
      noButtonsEnabled: 'لا توجد أزرار ممكّنة. قم بالتكوين في الإعدادات.',
      buttons: {
        reset: 'إعادة تعيين',
        undo: 'تراجع',
        subtract: 'طرح الأخير',
        add: 'إضافة الأخير',
      },
      buttonConfiguration: 'تكوين الأزرار',
      editPointValues: 'تعديل قيم النقاط',
      tapPointToEdit: 'اضغط على أي قيمة لتعديلها',
      editValue: 'تعديل قيمة النقطة',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      position: 'الموضع',
      invalidNumber: {
        title: 'رقم غير صالح',
        message: 'الرجاء إدخال رقم صالح.',
      },
      close: 'إغلاق',
      deleteValue: {
        title: 'حذف القيمة',
        message: 'هل أنت متأكد من رغبتك في حذف هذه القيمة؟',
        cancel: 'إلغاء',
        confirm: 'حذف'
      },
      enterValue: 'أدخل قيمة',
    },
    history: {
      title: 'سجل التقييم',
      empty: 'لا يوجد سجل',
      emptySubtext: 'ستظهر هنا جلسات التقييم الخاصة بك',
      total: 'المجموع',
      operations: 'العمليات',
      noHistory: 'لا يوجد سجل تقييم',
      sessionsWillAppear: 'ستظهر هنا جلسات التقييم الخاصة بك',
      pressRegisterButton: 'اضغط على زر التسجيل في الحاسبة لحفظ الجلسة',
      noOperations: 'لا توجد عمليات في هذه الجلسة',
      noStudentName: 'بدون اسم',
      unnamedStudent: 'بدون اسم',
      unnamedGroup: 'بدون اسم',
        noName: 'بدون اسم',
      unnamedGroupInfo: 'جلسات بدون اسم',
      noNameGroup: 'بدون اسم',
      noNameGroupInfo: 'جلسات بدون اسم',
      errors: {
        loadFailed: 'فشل في تحميل جلسات السجل:',
        clearFailed: 'فشل في مسح السجل:',
      },
      alerts: {
        clearTitle: 'مسح السجل',
        clearConfirm: 'هل أنت متأكد من رغبتك في مسح كل سجل التقييم؟ لا يمكن التراجع عن هذا الإجراء.',
        cleared: 'تم مسح كل السجل.',
        clearError: 'فشل في مسح السجل. يرجى المحاولة مرة أخرى.',
        deleteSessionTitle: 'حذف الجلسة',
        deleteSessionConfirm: 'هل أنت متأكد من رغبتك في حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.',
        deleteSessionWithStudentConfirm: 'هل أنت متأكد من رغبتك في حذف جلسة "{{student}}"؟ لا يمكن التراجع عن هذا الإجراء.',
        sessionDeleted: 'تم حذف الجلسة بنجاح.',
        deleteError: 'فشل في حذف الجلسة. يرجى المحاولة مرة أخرى.',
      },
      share: {
        button: 'مشاركة',
        title: 'مشاركة جلسة التقييم',
        date: 'التاريخ',
        total: 'المجموع',
        operations: 'العمليات',
        details: 'التفاصيل',
        emailSubject: 'جلسة تقييم من حاسبة تاكي',
        emailBody: 'إليك جلسة التقييم الخاصة بي من حاسبة تاكي:\n\nالتاريخ: {{date}}\nمجموع النقاط: {{total}}\nعدد العمليات: {{operations}}\n\n{{details}}',
        success: 'تمت مشاركة جلسة التقييم بنجاح',
        error: 'خطأ في مشاركة جلسة التقييم',
        noData: 'لا توجد بيانات للمشاركة',
        operationFormat: '{{time}}: {{value}} نقطة',
        student: 'الطالب',
      },
      export: {
        button: 'تصدير',
        title: 'تصدير الجلسات',
        selectSessions: 'اختر الجلسات للتصدير',
        noSessionsSelected: 'لم يتم اختيار أي جلسات',
        exportAs: 'تصدير كملف CSV',
        cancel: 'إلغاء',
        selectAll: 'اختيار الكل',
        deselectAll: 'إلغاء اختيار الكل',
        success: 'تم تصدير الجلسات بنجاح',
        error: 'خطأ في تصدير الجلسات',
        csvFilename: 'تصدير_تقييم_تاكي_{{date}}',
        sessionDate: 'تاريخ الجلسة',
        sessionTotal: 'المجموع',
        sessionOperations: 'العمليات',
        selectFormat: 'اختر التنسيق',
        formatQuestion: 'ما هو التنسيق الذي ترغب في التصدير إليه؟',
        standardCSV: 'CSV قياسي (,)',
        excelCSV: 'متوافق مع Excel (;)',
      },
      student: 'الطالب',
      groupByStudent: 'تجميع حسب الطالب',
      sessionCount: 'عدد الجلسات: {{count}}',
      delete: 'حذف',
      displayOptions: 'خيارات العرض',
      newestFirst: 'الأحدث أولاً',
      csv: {
        date: 'التاريخ',
        time: 'الوقت',
        student: 'الطالب',
        operations: 'العمليات',
        total: 'المجموع',
      },
    },
    settings: {
      title: 'الإعدادات',
      appearance: 'المظهر',
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع الفاتح',
      systemTheme: 'النظام',
      feedback: 'التفاعل',
      sound: 'الصوت',
      vibration: 'الاهتزاز',
      calculator: 'الحاسبة',
      customPoints: 'النقاط المخصصة',
      pointLimits: 'حدود النقاط',
      minPoint: 'الحد الأدنى للنقاط',
      maxPoint: 'الحد الأقصى للنقاط',
      language: 'اللغة',
      data: 'البيانات',
      clearData: 'مسح كل البيانات',
      shareApp: 'مشاركة التطبيق',
      shareAppDescription: 'مشاركة حاسبة تاكي أكاديمي مع الآخرين',
      shareAppMessage: 'جرب حاسبة تاكي أكاديمي، تطبيق مفيد للتقييم!',
      version: 'الإصدار',
      madeWith: 'Made with ❤️ by TakiAcademy',
      restartTutorial: 'إعادة تشغيل الدليل',
      buttonConfiguration: 'تكوين الأزرار',
      reorderButtons: 'إعادة ترتيب الأزرار',
      doneReordering: 'تم إعادة الترتيب',
      resetToDefaults: 'إعادة تعيين إلى الإعدادات الافتراضية',
      help: 'المساعدة',
      resetButtons: {
        title: 'إعادة تعيين الأزرار',
        message: 'هل أنت متأكد من أنك تريد إعادة تعيين تكوين الأزرار إلى الإعدادات الافتراضية؟',
        cancel: 'إلغاء',
        confirm: 'إعادة تعيين',
      },
      resetConfig: {
        title: 'إعادة تعيين التكوين',
        message: 'هل أنت متأكد من أنك تريد إعادة تعيين جميع إعدادات الأزرار إلى الإعدادات الافتراضية؟',
        cancel: 'إلغاء',
        confirm: 'إعادة تعيين'
      },
      resetPoints: {
        title: 'إعادة تعيين النقاط',
        message: 'هل أنت متأكد من أنك تريد إعادة تعيين جميع قيم النقاط إلى الإعدادات الافتراضية؟',
        cancel: 'إلغاء',
        confirm: 'إعادة تعيين',
      },
      resetPointValues: 'إعادة تعيين القيم الافتراضية',
      gridSize: 'عدد الأزرار المتاحة',
      pointValues: 'تكوين قيم الأزرار',
      gridSizeChanged: {
        title: 'تم تغيير حجم الشبكة',
        message: 'تم تغيير حجم الشبكة إلى {{size}} أزرار',
      },
      editPointValues: 'تعديل قيم الأزرار',
      selectTheme: 'اختيار الموضوع',
      themeDescription: 'اختر موضوعًا للتطبيق. يمكنك التبديل بين الوضع الفاتح والداكن، أو ترك النظام يقرر.',
      lightModeDesc: 'مظهر مشرق مع ألوان فاتحة',
      darkModeDesc: 'مظهر داكن مع ألوان خافتة',
      systemThemeDesc: 'يستخدم إعداد موضوع جهازك',
      selectGridSize: 'اختيار حجم الشبكة',
      gridSizeDescription: 'اختر عدد الأزرار التي تريد عرضها في الحاسبة. كل حجم له تخطيط مختلف.',
      buttons: 'أزرار',
      grid: 'شبكة',
      tapToEditValues: 'اضغط على أي قيمة لتعديلها أو حذفها. يمكن ملء الخلايا الفارغة بقيم جديدة.',
      reorderModeDesc: 'اضغط على الأسهم لتغيير ترتيب الأزرار',
      toggleModeDesc: 'قم بتفعيل الأزرار أو تعطيلها لتخصيص الحاسبة الخاصة بك',
      toggleMode: 'تبديل',
      reorderMode: 'إعادة ترتيب',
      buttonConfigDescription: 'تخصيص الأزرار التي تظهر في الحاسبة الخاصة بك وترتيبها',
    },
    languages: {
      fr: 'الفرنسية',
      en: 'الإنجليزية',
      ar: 'العربية',
    },
    alerts: {
      clearData: {
        title: 'مسح البيانات',
        message: 'هل أنت متأكد من رغبتك في مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
        cancel: 'إلغاء',
        confirm: 'مسح',
      },
      pointLimit: {
        title: 'حد النقاط',
        message: 'لقد تجاوزت الحد المسموح به للنقاط (0-20).',
        ok: 'موافق',
      },
      success: 'نجاح',
      error: 'خطأ',
    },
    common: {
      cancel: 'إلغاء',
      clear: 'مسح',
      success: 'نجاح',
      error: 'خطأ',
      delete: 'حذف',
    },
    tutorial: {
      welcome: 'مرحبا',
      welcomeDesc: 'مرحبا بك في حاسبة تاكي أكاديمي. سيوضح لك هذا الدليل السريع كيفية استخدام هذا التطبيق.',
      points: 'شبكة النقاط',
      pointsDesc: 'انقر على أي قيمة في الشبكة لإضافتها إلى المجموع. يتم تنظيم النقاط من 0.25 إلى 5.0 نقاط.',
      undo: 'تراجع',
      undoDesc: 'اضغط على هذا الزر للتراجع عن آخر عملية تم تنفيذها.',
      reset: 'إعادة تعيين',
      resetDesc: 'اضغط على هذا الزر لإعادة تعيين المجموع إلى صفر ومسح السجل الحالي.',
      repeat: 'تكرار',
      repeatDesc: 'استخدم هذه الأزرار لتكرار آخر عملية بسرعة (الطرح أو الإضافة).',
      register: 'تسجيل',
      registerDesc: 'اضغط على هذا الزر لحفظ الجلسة الحالية في السجل.',
      next: 'التالي',
      back: 'رجوع',
      finish: 'إنهاء',
      skip: 'تخطي',
    },
  },
};
