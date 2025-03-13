export default {
  translation: {
    appName: "Calculatrice du Prof",
    MaximumScore: 'Note maximale',
    calculator: {
      title: 'Calculatrice',
      register: 'Enregistrer',
      clear: 'Effacer',
      undo: 'Annuler',
      subtract: 'Soustraire',
      add: 'Ajouter',
      clicks: 'Opérations',
      maxScore: 'Note maximale',
      teacherMode: 'Mode enseignant',
      studentMode: 'Mode étudiant',
      showCalculator: 'Afficher la calculatrice',
      showAssignments: 'Afficher les devoirs',
      enterStudentName: 'Entrer le numéro de l\'étudiant',
      studentName: 'Numéro de l\'étudiant',
      noButtonsEnabled: 'Aucun bouton activé. Configurez dans Paramètres.',
      alerts: {
        noData: {
          title: 'Pas de données',
          message: "Il n'y a pas de données d'évaluation à enregistrer.",
        },
        noName: {
          title: "Pas de nom",
          message: "Veuillez entrer le nom de l'élève.",
        },
        saveSuccess: {
          title: 'Succès',
          message: 'Session enregistrée avec succès\nTotal: {{total}}\nOpérations: {{count}}\nÉtudiant: {{student}}\nClasse: {{class}}\nDevoir: {{assignment}}\nNote: {{percentage}}%, Précision: {{accuracy}}%'
        },
        saveError: {
          title: 'Erreur',
          message: 'Échec de l\'enregistrement de la session. Veuillez réessayer.',
        },
        noClass: {
          title: 'Aucune Classe Sélectionnée',
          message: 'Veuillez sélectionner une classe avant d\'enregistrer.',
        },
        noClassName: {
          title: 'Pas de Nom de Classe',
          message: 'Veuillez entrer un nom de classe.',
        },
        duplicateStudent: {
          title: 'Numéro d\'Étudiant en Double',
          message: 'Ce numéro d\'étudiant existe déjà. Veuillez utiliser un numéro différent.',
        },
        deleteClass: {
          title: 'Supprimer la Classe',
          message: 'Êtes-vous sûr de vouloir supprimer cette classe?',
          cancel: 'Annuler',
          confirm: 'Supprimer',
        },
        noAssignment: {
          title: 'Aucun devoir sélectionné',
          message: 'Veuillez sélectionner un devoir avant d\'enregistrer.',
        },
        exceedsMaxScore: {
          title: 'Note trop élevée',
          message: 'La note totale ne peut pas dépasser {{maxScore}}.',
        },
      },
      buttons: {
        reset: 'Réinitialiser',
        undo: 'Annuler',
        subtract: 'Soustraire Dernier',
        add: 'Ajouter Dernier',
      },
      buttonConfiguration: 'Configuration des Boutons',
      editPointValues: 'Modifier les Valeurs des Points',
      tapPointToEdit: 'Appuyez sur une valeur pour la modifier',
      editValue: 'Modifier la Valeur du Point',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      position: 'Position',
      invalidNumber: {
        title: 'Nombre Invalide',
        message: 'Veuillez entrer un nombre valide.',
      },
      close: 'Fermer',
      deleteValue: {
        title: 'Supprimer la Valeur',
        message: 'Êtes-vous sûr de vouloir supprimer cette valeur?',
        cancel: 'Annuler',
        confirm: 'Supprimer'
      },
      enterValue: 'Entrer une valeur',
      enterStudentName: 'Entrer le numéro de l\'étudiant',
      studentName: 'Numéro de l\'étudiant',
      selectClass: 'Sélectionner une classe',
      classModal: {
        title: 'Gestion des Classes',
        placeholder: 'Entrez le nom de la classe',
        add: 'Ajouter',
        update: 'Mettre à jour',
        noClasses: 'Pas encore de classes. Ajoutez votre première classe !',
        yourClasses: 'Vos Classes',
        instructions: 'Sélectionnez une classe pour l\'utiliser pour la notation. Vous pouvez également modifier ou supprimer des classes.',
      },
      showCalculator: 'Afficher la calculatrice',
      showAssignments: 'Afficher les devoirs',
      teacherMode: 'Mode enseignant',
      maxScore: 'Note maximale',
    },
    history: {
      title: 'Historique des Notes',
      empty: 'Aucun historique',
      emptySubtext: 'Vos sessions de notation apparaîtront ici',
      total: 'Total',
      operations: 'Opérations',
      noHistory: 'Aucun historique de notation',
      sessionsWillAppear: 'Vos sessions de notation apparaîtront ici',
      pressRegisterButton: 'Appuyez sur le bouton d\'enregistrement dans la calculatrice pour sauvegarder une session',
      noOperations: 'Aucune opération dans cette session',
      noStudentName: 'Sans Nom',
      unnamedStudent: 'Sans Nom',
      unnamedGroup: 'Sans Nom',
      unnamedGroupInfo: 'Sessions sans nom d\'étudiant',
      noNameGroup: 'Sans Nom',
      allClasses: 'Toutes les Classes',
      allAssignments: 'Tous les Devoirs',
      groupByStudent: 'Grouper par élève',
      displayOptions: 'Options d\'affichage',
      newestFirst: 'Plus récent d\'abord',
      sortOptions: 'Options de tri',
      sortByStudentNumber: 'Trier par numéro d\'étudiant',
      sortByMaxResult: 'Trier par résultat maximum',
      statistics: 'Statistiques',
      viewDetailedStats: 'Voir les statistiques détaillées',
      detailedStatistics: 'Statistiques détaillées',
      maxTotal: 'Total maximum',
      sessionCount: '{{count}} sessions',
      errors: {
        loadFailed: 'Échec de la récupération des sessions d\'historique:',
        clearFailed: 'Échec de l\'effacement de l\'historique:',
      },
      alerts: {
        clearTitle: 'Effacer l\'Historique',
        clearConfirm: 'Êtes-vous sûr de vouloir effacer tout l\'historique de notation ? Cette action ne peut pas être annulée.',
        cleared: 'Tout l\'historique a été effacé.',
        clearError: 'Échec de l\'effacement de l\'historique. Veuillez réessayer.',
        deleteSessionTitle: 'Supprimer la Session',
        deleteSessionConfirm: 'Êtes-vous sûr de vouloir supprimer cette session ? Cette action ne peut pas être annulée.',
        deleteSessionWithStudentConfirm: 'Êtes-vous sûr de vouloir supprimer la session de "{{student}}" ? Cette action ne peut pas être annulée.',
        sessionDeleted: 'Session supprimée avec succès.',
        deleteError: 'Échec de la suppression de la session. Veuillez réessayer.',
      },
      share: {
        button: 'Partager',
        title: 'Partager la Session de Notation',
        date: 'Date',
        total: 'Total',
        operations: 'Opérations',
        details: 'Détails',
        emailSubject: 'Session de Notation de Taki Calculator',
        emailBody: 'Voici ma session de notation de Taki Calculator:\n\nDate: {{date}}\nPoints Totaux: {{total}}\nNombre d\'Opérations: {{operations}}\n\n{{details}}',
        success: 'Session de notation partagée avec succès',
        error: 'Erreur lors du partage de la session de notation',
        noData: 'Aucune donnée à partager',
        operationFormat: '{{time}}: {{value}} points',
        student: 'Élève',
      },
      export: {
        button: 'Exporter',
        title: 'Exporter les Sessions',
        selectSessions: 'Sélectionner les sessions à exporter',
        filteredByClass: 'Filtré par classe',
        noSessionsSelected: 'Aucune session sélectionnée',
        exportAs: 'Exporter en CSV',
        cancel: 'Annuler',
        selectAll: 'Tout Sélectionner',
        deselectAll: 'Tout Désélectionner',
        success: 'Sessions exportées avec succès',
        error: 'Erreur lors de l\'exportation des sessions',
        csvFilename: 'taki_export_notation_{{date}}',
        sessionDate: 'Date de Session',
        sessionTotal: 'Total',
        sessionOperations: 'Opérations',
        selectFormat: 'Sélectionner le Format',
        formatQuestion: 'Quel format souhaitez-vous exporter?',
        standardCSV: 'CSV Standard (,)',
        excelCSV: 'Compatible Excel (;)',
      },
      student: 'Élève',
      csv: {
        date: 'Date',
        time: 'Heure',
        student: 'Élève',
        operations: 'Opérations',
        total: 'Total',
      },
      noSessionsSelected: 'Aucune session sélectionnée',
      pleaseSelectSessions: 'Veuillez sélectionner au moins une session pour voir les statistiques.',
      noSessionsAvailable: 'Aucune session disponible',
      noSessionsToAnalyze: 'Il n\'y a aucune session disponible à analyser.',
      noClass: 'Aucune classe',
      noStudent: 'Aucun étudiant',
      sessions: 'Sessions',
      average: 'Moyenne',
      highest: 'Plus élevé',
      lowest: 'Plus bas',
      studentBreakdown: 'Détails par élève',
      classBreakdown: 'Répartition par classe',
      standardDeviation: 'Écart type',
      medianScore: 'Score médian',
      progressTrend: 'Tendance de progression',
      improving: 'En amélioration',
      declining: 'En baisse',
      stable: 'Stable',
      noTrend: 'Pas assez de données',
      performanceMetrics: 'Métriques de performance',
      frequencyDistribution: 'Distribution des scores',
      scoreRange: 'Plage de scores',
      scoreFrequency: 'Fréquence',
      improvementRate: 'Taux d\'amélioration',
      consistencyScore: 'Score de constance',
      veryConsistent: 'Très constant',
      consistent: 'Constant',
      inconsistent: 'Inconstant',
      veryInconsistent: 'Très inconstant',
      comparisonToClass: 'Comparaison avec la classe',
      aboveAverage: 'Au-dessus de la moyenne',
      belowAverage: 'En dessous de la moyenne',
      atAverage: 'Dans la moyenne',
      percentile: 'Percentile',
      recentPerformance: 'Performance récente',
      overallTrend: 'Tendance générale',
      assignmentStatistics: 'Statistiques des Devoirs',
      maxPossibleScore: 'Score Maximum Possible',
      averageScore: 'Score Moyen',
      highestScore: 'Meilleur Score',
      lowestScore: 'Score le Plus Bas',
      totalAttempts: 'Nombre Total de Tentatives',
      averageAccuracy: 'Précision Moyenne',
      averageTime: 'Temps Moyen',
      studentPerformance: 'Performance des Élèves',
      attempts: 'Tentatives',
      bestScore: 'Meilleur Score',
      improvement: 'Amélioration',
    },
    settings: {
      title: 'Paramètres',
      appearance: 'Apparence',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair',
      systemTheme: 'Système',
      feedback: 'Retour',
      sound: 'Son',
      vibration: 'Vibration',
      calculator: 'Calculatrice',
      customPoints: 'Points personnalisés',
      pointLimits: 'Limites de points',
      minPoint: 'Point minimum',
      maxPoint: 'Point maximum',
      language: 'Langue',
      data: 'Données',
      clearData: 'Effacer toutes les données',
      shareApp: 'Partager l\'application',
      shareAppDescription: 'Partager Calculatrice TakiAcademy avec d\'autres',
      shareAppMessage: 'Découvrez Calculatrice TakiAcademy, une application utile pour la notation!',
      version: 'Version',
      madeWith: 'Fait avec ❤️ par Taki Academy',
      restartTutorial: 'Redémarrer le guide',
      buttonConfiguration: 'Configuration des Boutons',
      reorderButtons: 'Réorganiser les Boutons',
      doneReordering: 'Terminer la Réorganisation',
      resetToDefaults: 'Réinitialiser par Défaut',
      help: 'Aide',
      resetButtons: {
        title: 'Réinitialiser les Boutons',
        message: 'Êtes-vous sûr de vouloir réinitialiser la configuration des boutons par défaut?',
        cancel: 'Annuler',
        confirm: 'Réinitialiser',
      },
      resetConfig: {
        title: 'Réinitialiser la Configuration',
        message: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres de boutons par défaut?',
        cancel: 'Annuler',
        confirm: 'Réinitialiser'
      },
      resetPoints: {
        title: 'Réinitialiser les Points',
        message: 'Êtes-vous sûr de vouloir réinitialiser toutes les valeurs de points par défaut?',
        cancel: 'Annuler',
        confirm: 'Réinitialiser',
      },
      resetPointValues: 'Restaurer les Valeurs par Défaut',
      gridSize: 'Nombre de boutons disponibles',
      pointValues: 'Configuration des Valeurs des Boutons',
      gridSizeChanged: {
        title: 'Taille de la Grille Modifiée',
        message: 'Taille de la grille modifiée à {{size}} boutons',
      },
      editPointValues: 'Modifier les Valeurs des Boutons',
      selectTheme: 'Sélectionner le Thème',
      themeDescription: 'Choisissez un thème pour l\'application. Vous pouvez basculer entre le mode clair et sombre, ou laisser le système décider.',
      lightModeDesc: 'Thème lumineux avec des couleurs claires',
      darkModeDesc: 'Thème sombre avec des couleurs tamisées',
      systemThemeDesc: 'Utilise le paramètre de thème de votre appareil',
      selectGridSize: 'Sélectionner la Taille de la Grille',
      gridSizeDescription: 'Choisissez combien de boutons vous souhaitez afficher dans la calculatrice. Chaque taille a une disposition différente.',
      buttons: 'Boutons',
      grid: 'Grille',
      tapToEditValues: 'Appuyez sur n\'importe quelle valeur pour la modifier ou la supprimer. Les cellules vides peuvent être remplies avec de nouvelles valeurs.',
      reorderModeDesc: 'Appuyez sur les flèches pour changer l\'ordre des boutons',
      toggleModeDesc: 'Activez ou désactivez les boutons pour personnaliser votre calculatrice',
      toggleMode: 'Activer/Désactiver',
      reorderMode: 'Réorganiser',
      buttonConfigDescription: 'Personnalisez quels boutons apparaissent dans votre calculatrice et leur ordre',
    },
    languages: {
      fr: 'Français',
      en: 'Anglais',
      ar: 'Arabe',
    },
    alerts: {
      clearData: {
        title: 'Effacer les données',
        message: 'Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.',
        cancel: 'Annuler',
        confirm: 'Effacer',
      },
      pointLimit: {
        title: 'Limite de points',
        message: 'Vous avez dépassé la limite de points autorisée (0-20).',
        ok: 'OK',
      },
      success: 'Succès',
      error: 'Erreur',
    },
    common: {
      cancel: 'Annuler',
      clear: 'Effacer',
      success: 'Succès',
      error: 'Erreur',
      delete: 'Supprimer',
      enabled: 'Activé',
      disabled: 'Désactivé',
    },
    tutorial: {
      welcome: 'Bienvenue',
      welcomeDesc: 'Bienvenue dans la calculatrice de notations Taki Academy. Ce guide rapide vous montrera comment utiliser cette application.',
      points: 'Grille de points',
      pointsDesc: 'Cliquez sur n\'importe quelle valeur dans la grille pour l\'ajouter au total. Les points sont organisés de 0.25 à 5.0 points.',
      undo: 'Annuler',
      undoDesc: 'Appuyez sur ce bouton pour annuler la dernière opération effectuée.',
      reset: 'Réinitialiser',
      resetDesc: 'Appuyez sur ce bouton pour réinitialiser le total à zéro et effacer l\'historique actuel.',
      repeat: 'Répéter',
      repeatDesc: 'Utilisez ces boutons pour répéter rapidement la dernière opération (soustraction ou addition).',
      register: 'Enregistrer',
      registerDesc: 'Appuyez sur ce bouton pour enregistrer la session actuelle dans l\'historique.',
      next: 'Suivant',
      back: 'Retour',
      finish: 'Terminer',
      skip: 'Passer',
    },
    assignments: {
      newAssignment: 'Nouveau devoir',
      titlePlaceholder: 'Titre du devoir',
      maxScorePlaceholder: 'Note maximale',
      add: 'Ajouter un devoir',
      selected: 'Devoir sélectionné',
      maxScore: 'Note maximale',
      titleRequired: 'Veuillez saisir un titre pour le devoir',
      invalidMaxScore: 'Veuillez saisir une note maximale valide',
      addSuccess: 'Devoir ajouté avec succès',
      saveFailed: 'Échec de l\'enregistrement du devoir'
    },
    errors: {
      required: 'Champ obligatoire',
      invalid: 'Entrée invalide',
      error: 'Erreur'
    },
  },
};
